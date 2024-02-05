import json
from fund_public_goods.lib.strategy.utils.calculate_weights import calculate_weights
from fund_public_goods.lib.strategy.utils.fetch_matching_projects import fetch_matching_projects
from fund_public_goods.lib.strategy.utils.initialize_logs import initialize_logs
from fund_public_goods.lib.strategy.utils.score_projects import score_projects
import inngest
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores
from fund_public_goods.lib.strategy.utils.evaluate_project import (
    evaluate_project,
)
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.models.weighted_project import WeightedProject
from fund_public_goods.db.tables.runs import get_prompt
from fund_public_goods.db.tables.strategy_entries import insert_multiple
from fund_public_goods.db import logs
from fund_public_goods.db.entities import StepName, StepStatus
from fund_public_goods.workflows.create_strategy.events import CreateStrategyEvent


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

    prompt = await step.run(
        "extract_prompt",
        lambda: get_prompt(run_id),
    )
    
    log_ids_str = await step.run(
        "initialize_logs",
        lambda: initialize_logs(run_id),
    )
    
    log_ids: dict[StepName, str] = json.loads(log_ids_str)
    
    await step.run(
        "start_fetch_projects_data",
        lambda: logs.update(
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.FETCH_PROJECTS],
            value=None,
        ),
    )

    json_projects = await step.run(
        "fetch_projects_data", lambda: fetch_matching_projects(prompt)
    )

    projects = [Project(**json_project) for json_project in json_projects]

    await step.run(
        "completed_fetch_projects_data",
        lambda: logs.update(
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.FETCH_PROJECTS],
            value=f"Found {len(projects)} projects related to '{prompt}'",
        ),
    )
    
    await step.run(
        "start_assess_projects",
        lambda: logs.update(
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.EVALUATE_PROJECTS],
            value=None,
        ),
    )

    projects_with_reports: list[tuple[Project, str]] = []
    
    for project in projects:
        report = await step.run(
            f"assess_project_{project.id}", lambda: evaluate_project(prompt, project)
        )
        projects_with_reports.append((project, report))
    
    await step.run(
        "completed_assess_projects",
        lambda: logs.update(
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.EVALUATE_PROJECTS],
            value=f"Evaluated {len(projects_with_reports)} projects",
        ),
    )
    
    await step.run(
        "start_determine_funding",
        lambda: logs.update(
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.ANALYZE_FUNDING],
            value=None,
        ),
    )

    json_project_scores = await step.run(
        "determine_funding", lambda: score_projects(projects_with_reports)
    )
    project_scores = [ProjectScores(**x) for x in json_project_scores]  # type: ignore
    
    json_weighted_projects = await step.run(
        "calculate_weights", lambda: calculate_weights(projects_with_reports, project_scores)
    )
    
    weighted_projects = [WeightedProject(**json_weighted_project) for json_weighted_project in json_weighted_projects] # type: ignore
    
    await step.run(
        "completed_determine_funding",
        lambda: logs.update(
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.ANALYZE_FUNDING],
            value="Determined the relative funding that the best matching projects need",
        ),
    )
    
    await step.run(
        "start_synthesize_results",
        lambda: logs.update(
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value=None
        ),
    )

    await step.run(
        "save_strategy_to_db", lambda: insert_multiple(run_id, weighted_projects)
    )
    
    await step.run(
        "completed_synthesize_results",
        lambda: logs.update(
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value="Results generated"
        ),
    )

    return "done"
