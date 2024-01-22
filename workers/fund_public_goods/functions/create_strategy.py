from fund_public_goods.agents.researcher.functions.assign_weights import assign_weights
from fund_public_goods.agents.researcher.functions.evaluate_projects import evaluate_projects
from fund_public_goods.agents.researcher.models.evaluated_project import EvaluatedProject
from fund_public_goods.agents.researcher.models.project import Project
from fund_public_goods.agents.researcher.models.weighted_project import WeightedProject
import inngest
from fund_public_goods.events import CreateStrategyEvent
from fund_public_goods.db import client, logs
from supabase import Client

def save_strategy_to_db(supabase: Client, run_id: str, entries: list[WeightedProject]):
    supabase.table('strategy_entries').insert([{
        "run_id": run_id,
        "reasoning": entry.evaluation.reasoning,
        "weight": entry.weight,
        "impact": entry.evaluation.impact,
        "interest": entry.evaluation.interest
    } for entry in entries]).execute()

def fetch_projects_data(supabase: Client):
    response = supabase.table("gitcoin_projects").select("id, data, protocol, gitcoin_applications(id, data)").execute()
    projects = []

    for item in response.data:
        project_data = item.get('data', {})
        project_id = item.get('id', '')

        answers = []
        for app in item.get('gitcoinApplications', []):
            app_data = app.get('data', {}).get('application', {})
            for ans in app_data.get('answers', []):
                answer = {
                    "question": ans.get('question', ''),
                    "answer": ans.get('answer', None)
                }
                answers.append(answer)

        project = {
            "id": project_id,
            "title": project_data.get('title', ''),
            "recipient": project_data.get('recipient', ''),
            "description": project_data.get('description', ''),
            "website": project_data.get('website', ''),
            "answers": answers
        }
        projects.append(project)

    return projects


def extract_prompt(supabase: Client, run_id: str):
    return supabase.table('runs').select("prompt").eq("id", run_id).limit(1).single().execute().data


@inngest.create_function(
    fn_id="on_create_strategy",
    trigger=CreateStrategyEvent.trigger,
)
async def create_strategy(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str | None:
    data = CreateStrategyEvent.Data.model_validate(ctx.event.data)
    run_id = data.run_id
    supabase = client.create_admin()
    
    await step.run(
        "extracting_prompt",
        lambda: logs.insert(
            supabase,
            run_id,
            "Extracting prompt from run_id"
        ),
    )
    
    prompt = await step.run(
        "extract_prompt",
        lambda: extract_prompt(supabase, run_id)
    )

    await step.run(
        "getting_info",
        lambda: logs.insert(
            supabase,
            run_id,
            "Getting information from data sources"
        ),
    )

    json_projects = await step.run(
        "fetch_projects_data",
        lambda: fetch_projects_data(supabase)
    )
    
    projects: list[Project] = [Project(**json_project) for json_project in json_projects]

    await step.run(
        "assessing",
        lambda: logs.insert(
            supabase,
            run_id,
            "Assessing impact of each project realted to the users interest",
        ),
    )
    
    json_asessed_projects = await step.run(
        "evaluate_projects",
        lambda: evaluate_projects(prompt, projects)
    )
    assessed_projects = [EvaluatedProject(**x) for x in json_asessed_projects] # type: ignore

    await step.run(
        "determine",
        lambda: logs.insert(
            supabase,
            run_id,
            "Determining the relative funding that the best matching projects need",
        ),
    )
    
    json_weighted_projects: list[WeightedProject] = await step.run(
        "fetch_projects_data",
        lambda: assign_weights(assessed_projects)
    )
    weighted_projects = [WeightedProject(**x) for x in json_weighted_projects] # type: ignore

    await step.run("result", lambda: logs.insert(
        supabase,
        run_id,
        "Generating results"
    ))
    
    await step.run(
        "save_strategy_to_db",
        lambda: save_strategy_to_db(supabase, run_id, weighted_projects)
    )

    await step.run("result", lambda: logs.insert(
        supabase,
        run_id,
        "STRATEGY_CREATED"
    ))
    
    return "done"
