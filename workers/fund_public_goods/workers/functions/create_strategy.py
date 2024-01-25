from fund_public_goods.agents.researcher.functions.assign_weights import assign_weights
from fund_public_goods.agents.researcher.functions.evaluate_projects import (
    evaluate_projects,
)
from fund_public_goods.agents.researcher.functions.get_top_matching_projects import get_top_matching_projects
from fund_public_goods.agents.researcher.models.answer import Answer
from fund_public_goods.agents.researcher.models.evaluated_project import (
    EvaluatedProject,
)
from fund_public_goods.agents.researcher.models.project import Project
from fund_public_goods.agents.researcher.models.weighted_project import WeightedProject
import inngest
from fund_public_goods.db.tables.projects import fetch_projects_data
from fund_public_goods.db.tables.runs import get_prompt
from fund_public_goods.db.tables.strategy_entries import insert_multiple
from fund_public_goods.workers.events import CreateStrategyEvent
from fund_public_goods.db import client, logs
from supabase import Client
import typing


StepNames = typing.Literal["FETCH_PROJECTS", "EVALUATE_PROJECTS", "ANALYZE_FUNDING", "SYNTHESIZE_RESULTS"]
step_names: list[StepNames] = ["FETCH_PROJECTS", "EVALUATE_PROJECTS", "ANALYZE_FUNDING", "SYNTHESIZE_RESULTS"]


def fetch_matching_projects(supabase: Client, prompt: str):
    projects = fetch_projects_data(supabase)
    matching_projects = get_top_matching_projects(prompt, projects)
    
    return [project.model_dump() for project in matching_projects]


def initialize_logs(supabase: Client, run_id: str) -> dict[StepNames, str]:
    log_ids: dict[StepNames, str] = {}
    
    for step_name in step_names: 
        new_log = logs.create(
            db=supabase,
            run_id=run_id,
            step_name=step_name,
        ).data
        
        log_ids[step_name] = new_log[0]["id"]

    return log_ids

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
    
    prompt = get_prompt(supabase, run_id)
    log_ids = initialize_logs(supabase, run_id)
    
    await step.run(
        "start_fetch_projects_data",
        lambda: logs.update(
            db=supabase,
            status="IN_PROGRESS",
            log_id=log_ids["FETCH_PROJECTS"],
            value=None,
        ),
    )

    json_projects = await step.run(
        "fetch_projects_data", lambda: fetch_matching_projects(supabase, prompt)
    )

    projects = [Project(**json_project) for json_project in json_projects]
    
    await step.run(
        "completed_fetch_projects_data",
        lambda: logs.update(
            db=supabase,
            status="COMPLETED",
            log_id=log_ids["FETCH_PROJECTS"],
            value=f"Found {len(projects)} projects related to '{prompt}'",
        ),
    )
    
    await step.run(
        "start_assess_projects",
        lambda: logs.update(
            db=supabase,
            status="IN_PROGRESS",
            log_id=log_ids["EVALUATE_PROJECTS"],
            value=None,
        ),
    )

    json_asessed_projects = await step.run(
        "assess_projects", lambda: evaluate_projects(prompt, projects)
    )
    assessed_projects = [EvaluatedProject(**x) for x in json_asessed_projects]  # type: ignore
    
    await step.run(
        "completed_assess_projects",
        lambda: logs.update(
            db=supabase,
            status="COMPLETED",
            log_id=log_ids["EVALUATE_PROJECTS"],
            value=f"Evaluated {len(assessed_projects)} projects",
        ),
    )
    
    await step.run(
        "start_determine_funding",
        lambda: logs.update(
            supabase,
            status="IN_PROGRESS",
            log_id=log_ids["ANALYZE_FUNDING"],
            value=None,
        ),
    )

    json_weighted_projects: list[WeightedProject] = await step.run(
        "determine_funding", lambda: assign_weights(assessed_projects)
    )
    weighted_projects = [WeightedProject(**x) for x in json_weighted_projects]  # type: ignore
    
    await step.run(
        "completed_determine_funding",
        lambda: logs.update(
            supabase,
            status="COMPLETED",
            log_id=log_ids["ANALYZE_FUNDING"],
            value="Determined the relative funding that the best matching projects need",
        ),
    )
    
    await step.run(
        "start_synthesize_results",
        lambda: logs.update(
            supabase,
            status="IN_PROGRESS",
            log_id=log_ids["SYNTHESIZE_RESULTS"],
            value=None
        ),
    )

    await step.run(
        "save_strategy_to_db", lambda: insert_multiple(supabase, run_id, weighted_projects)
    )
    
    await step.run(
        "completed_synthesize_results",
        lambda: logs.update(
            supabase,
            status="COMPLETED",
            log_id=log_ids["SYNTHESIZE_RESULTS"],
            value="Results generated"
        ),
    )

    return "done"
