import json
import typing
from fund_public_goods.lib.strategy.utils.get_top_matching_projects import get_top_matching_projects
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
from fund_public_goods.db.tables.projects import fetch_projects_data
from fund_public_goods.db.tables.runs import get_prompt
from fund_public_goods.db.tables.strategy_entries import insert_multiple
from fund_public_goods.db import client, logs
from fund_public_goods.db.entities import StepName, StepStatus
from fund_public_goods.workflows.create_strategy.events import CreateStrategyEvent

def fetch_matching_projects(supabase: Client, prompt: str):
    projects = fetch_projects_data(supabase)
    matching_projects = get_top_matching_projects(prompt, projects)
    
    return [project.model_dump() for project in matching_projects]


def initialize_logs(supabase: Client, run_id: str) -> str:
    log_ids: dict[StepName, str] = {}

    for step_name in StepName:
        new_log = logs.create(
            db=supabase,
            run_id=run_id,
            step_name=step_name,
        ).data
        
        log_ids[step_name] = new_log[0]["id"]

    return json.dumps(log_ids)

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

    prompt = await step.run(
        "extract_prompt",
        lambda: get_prompt(db, run_id),
    )
    
    log_ids_str = await step.run(
        "initialize_logs",
        lambda: initialize_logs(db, run_id),
    )
    
    log_ids: dict[StepName, str] = json.loads(log_ids_str)
    
    await step.run(
        "start_fetch_projects_data",
        lambda: logs.update(
            db=db,
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.FETCH_PROJECTS],
            value=None,
        ),
    )

    json_projects = await step.run(
        "fetch_projects_data", lambda: fetch_matching_projects(db, prompt)
    )

    projects = [Project(**json_project) for json_project in json_projects]

    await step.run(
        "completed_fetch_projects_data",
        lambda: logs.update(
            db=db,
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.FETCH_PROJECTS],
            value=f"Found {len(projects)} projects related to '{prompt}'",
        ),
    )
    
    await step.run(
        "start_assess_projects",
        lambda: logs.update(
            db=db,
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.EVALUATE_PROJECTS],
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
            db=db,
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.EVALUATE_PROJECTS],
            value=f"Evaluated {len(assessed_projects)} projects",
        ),
    )
    
    await step.run(
        "start_determine_funding",
        lambda: logs.update(
            db,
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.ANALYZE_FUNDING],
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
            db,
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.ANALYZE_FUNDING],
            value="Determined the relative funding that the best matching projects need",
        ),
    )
    
    await step.run(
        "start_synthesize_results",
        lambda: logs.update(
            db,
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value=None
        ),
    )

    await step.run(
        "save_strategy_to_db", lambda: insert_multiple(db, run_id, weighted_projects)
    )
    
    await step.run(
        "completed_synthesize_results",
        lambda: logs.update(
            db,
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value="Results generated"
        ),
    )

    return "done"
