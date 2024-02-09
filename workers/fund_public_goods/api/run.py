from fund_public_goods.db import tables, app_db
from fund_public_goods.db.entities import StepStatus, StepName, Logs
from fund_public_goods.db.tables.runs import get_prompt
from fund_public_goods.db.tables.strategy_entries import insert_multiple
from fund_public_goods.lib.strategy.utils.score_projects import score_projects
from fund_public_goods.lib.strategy.utils.evaluate_project import evaluate_project
from fund_public_goods.lib.strategy.utils.calculate_weights import calculate_weights
from fund_public_goods.lib.strategy.utils.fetch_matching_projects import fetch_matching_projects
from fund_public_goods.lib.strategy.models.project import Project
from supabase.lib.client_options import ClientOptions
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional, cast


router = APIRouter()

class Params(BaseModel):
    run_id: str

class Response(BaseModel):
    status: str

@router.post("/api/runs/run")
async def run(params: Params, authorization: Optional[str] = Header(None)) -> Response:

    if authorization:
        supabase_auth_token = authorization.split(" ")[1]
    else:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    run_id = params.run_id if params.run_id else ""

    if run_id == "":
        raise HTTPException(status_code=400, detail="RunID cannot be empty.")

    db = app_db.create(options=ClientOptions())
    db.postgrest.auth(supabase_auth_token)

    logs_res = tables.logs.get(run_id, db)

    if logs_res == None:
        raise HTTPException(status_code=400, detail="RunID does not exist.")

    logs = cast(list[Logs], logs_res)

    for log in logs:
        if log.status != StepStatus.NOT_STARTED:
            raise HTTPException(status_code=400, detail="RunId has already been run.")

    log_ids: dict[StepName, str] = {
        log.step_name: str(log.id) for log in logs
    }

    prompt = get_prompt(run_id)

    tables.logs.update(
        status=StepStatus.IN_PROGRESS,
        log_id=log_ids[StepName.FETCH_PROJECTS],
        value=None,
    )

    projects = fetch_matching_projects(prompt)

    tables.logs.update(
        status=StepStatus.COMPLETED,
        log_id=log_ids[StepName.FETCH_PROJECTS],
        value=f"Found {len(projects)} projects related to '{prompt}'",
    )
    
    tables.logs.update(
        status=StepStatus.IN_PROGRESS,
        log_id=log_ids[StepName.EVALUATE_PROJECTS],
        value=None,
    )

    project_ids_with_reports: list[tuple[str, str]] = []
    
    for project in projects:
        report = evaluate_project(prompt, project)
        project_ids_with_reports.append((project.id, report))
    
    tables.logs.update(
        status=StepStatus.COMPLETED,
        log_id=log_ids[StepName.EVALUATE_PROJECTS],
        value=f"Evaluated {len(project_ids_with_reports)} projects",
    )
    
    tables.logs.update(
        status=StepStatus.IN_PROGRESS,
        log_id=log_ids[StepName.ANALYZE_FUNDING],
        value=None,
    )

    project_scores = score_projects(project_ids_with_reports)
    
    weighted_projects = calculate_weights(project_ids_with_reports, project_scores)
    
    tables.logs.update(
        status=StepStatus.COMPLETED,
        log_id=log_ids[StepName.ANALYZE_FUNDING],
        value="Determined the relative funding that the best matching projects need",
    )
    
    tables.logs.update(
        status=StepStatus.IN_PROGRESS,
        log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
        value=None
    )

    insert_multiple(run_id, weighted_projects)
    
    tables.logs.update(
        status=StepStatus.COMPLETED,
        log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
        value="Results generated"
    )

    return Response(
        status="done"
    )
