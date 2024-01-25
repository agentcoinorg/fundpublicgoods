import inngest
from supabase import Client
from fund_public_goods.lib.strategy.utils.assign_weights import assign_weights
from fund_public_goods.lib.strategy.utils.evaluate_projects import (
    evaluate_projects,
)
from fund_public_goods.lib.strategy.models.evaluated_project import (
    EvaluatedProject,
)
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.models.weighted_project import WeightedProject
from fund_public_goods.db.tables.projects import get_projects
from fund_public_goods.db.tables.runs import get_prompt
from fund_public_goods.db.tables.strategy_entries import insert_multiple
from fund_public_goods.db import client, tables, entities
from fund_public_goods.workflows.create_strategy.events import CreateStrategyEvent


def fetch_projects_data(supabase: Client) -> list[Project]:
    response = get_projects(supabase)
    projects = []

    for item in response.data:
        answers = []

        for application in item.get("applications", []):
            for answer in application.get("answers", []):
                answers.append(
                    {
                        "question": answer.get("question", ""),
                        "answer": answer.get("answer", None),
                    }
                )

        project = Project(
            id=item.get("id", ""),
            title=item.get("title", ""),
            description=item.get("description", ""),
            website=item.get("website", ""),
            answers=answers,
        )
        projects.append(project)

    return projects


@inngest.create_function(
    fn_id="create_strategy",
    trigger=CreateStrategyEvent.trigger,
)
async def create_strategy(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str | None:
    data = CreateStrategyEvent.Data.model_validate(ctx.event.data)
    run_id = data.run_id
    db = client.create_admin()

    await step.run(
        "extracting_prompt",
        lambda: tables.logs.insert(db, entities.Logs(
            run_id=run_id,
            message="Extracting prompt from run_id"
        )),
    )

    prompt = await step.run("extract_prompt", lambda: get_prompt(db, run_id))

    await step.run(
        "fetching_projects_info",
        lambda: tables.logs.insert(db, entities.Logs(
            run_id=run_id,
            message="Getting information from data sources"
        )),
    )

    json_projects = await step.run(
        "fetch_projects_data", lambda: fetch_projects_data(db)
    )

    projects: list[Project] = [Project(**json_project) for json_project in json_projects]  # type: ignore

    await step.run(
        "assessing",
        lambda: tables.logs.insert(db, entities.Logs(
            run_id=run_id,
            message="Assessing impact of each project realted to the users interest"
        )),
    )

    json_asessed_projects = await step.run(
        "assess_projects", lambda: evaluate_projects(prompt, projects)
    )
    assessed_projects = [EvaluatedProject(**x) for x in json_asessed_projects]  # type: ignore

    await step.run(
        "determining_funding",
        lambda: tables.logs.insert(db, entities.Logs(
            run_id=run_id,
            message="Determining the relative funding that the best matching projects need"
        )),
    )

    json_weighted_projects: list[WeightedProject] = await step.run(
        "determine_funding", lambda: assign_weights(assessed_projects)
    )
    weighted_projects = [WeightedProject(**x) for x in json_weighted_projects]  # type: ignore

    await step.run(
        "saving_results_to_db",
        lambda: tables.logs.insert(db, entities.Logs(
            run_id=run_id,
            message="Generating results"
        )),
    )

    await step.run(
        "save_strategy_to_db", lambda: insert_multiple(db, run_id, weighted_projects)
    )

    await step.run("result", lambda: tables.logs.insert(db, entities.Logs(
        run_id=run_id,
        message="STRATEGY_CREATED"
    )),)

    return "done"
