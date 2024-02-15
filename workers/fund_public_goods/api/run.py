from fund_public_goods.db import tables, app_db
from fund_public_goods.db.entities import Projects, StepStatus, StepName, Logs
from fund_public_goods.db.tables.projects import upsert_multiple
from fund_public_goods.db.tables.runs import get_prompt
from fund_public_goods.db.tables.strategy_entries import insert_multiple
from fund_public_goods.lib.strategy.utils.evaluate_projects import evaluate_projects
from fund_public_goods.lib.strategy.utils.score_projects import score_projects
from fund_public_goods.lib.strategy.utils.calculate_weights import calculate_weights
from fund_public_goods.lib.strategy.utils.fetch_matching_projects import fetch_matching_projects
from fund_public_goods.lib.strategy.utils.summarize_descriptions import summarize_descriptions
from supabase.lib.client_options import ClientOptions
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional, cast
from langchain_community.callbacks import get_openai_callback


router = APIRouter()

class Params(BaseModel):
    run_id: str

class Response(BaseModel):
    status: str

@router.post("/api/runs/run")
async def run(params: Params, authorization: Optional[str] = Header(None)) -> Response:
    with get_openai_callback() as cb:
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
            if log.step_name != StepName.FETCH_PROJECTS and log.status != StepStatus.NOT_STARTED:
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

        projects_with_answers = []
        try:
            projects_with_answers = fetch_matching_projects(prompt)
            tables.logs.update(
                status=StepStatus.COMPLETED,
                log_id=log_ids[StepName.FETCH_PROJECTS],
                value=f"Found {len(projects_with_answers)} projects related to '{prompt}'",
            )
        except Exception as error:
            tables.logs.update(
                status=StepStatus.ERRORED,
                log_id=log_ids[StepName.FETCH_PROJECTS],
                value=f"An error occurred: {type(error).__name__} - {str(error)} ",
            )
            return

        reports = []
        try:
            tables.logs.update(
                status=StepStatus.IN_PROGRESS,
                log_id=log_ids[StepName.EVALUATE_PROJECTS],
                value=None,
            )
            reports = evaluate_projects(prompt, projects_with_answers)
            tables.logs.update(
                status=StepStatus.COMPLETED,
                log_id=log_ids[StepName.EVALUATE_PROJECTS],
                value=f"Generated impact & funding needs reports for {len(projects_with_reports)} projects",
            )
        except Exception as error:
            print("this is an error ma g")
            print(error)
            tables.logs.update(
                status=StepStatus.ERRORED,
                log_id=log_ids[StepName.EVALUATE_PROJECTS],
                value=f"An error occurred: {type(error).__name__} - {str(error)} ",
            )
            return

        projects_with_reports: list[tuple[Projects, str]] = [(projects_with_answers[i][0], reports[i]) for i in range(len(reports))]
        weighted_projects = []
        try:
            tables.logs.update(
                status=StepStatus.IN_PROGRESS,
                log_id=log_ids[StepName.ANALYZE_FUNDING],
                value=None,
            )
            project_scores = score_projects(projects_with_reports, prompt)
            weighted_projects = calculate_weights(projects_with_reports, project_scores)

            tables.logs.update(
                status=StepStatus.COMPLETED,
                log_id=log_ids[StepName.ANALYZE_FUNDING],
                value=f"Computed smart rankings for {len(weighted_projects)} projects",
            )
        except:
            tables.logs.update(
                status=StepStatus.ERRORED,
                log_id=log_ids[StepName.ANALYZE_FUNDING],
                value=f"An error occurred: {type(error).__name__} - {str(error)} ",
            )
            return

        tables.logs.update(
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value=None
        )
        projects = [project for (project, _) in projects_with_answers]
        projects_without_short_desc = [p for p in projects if not p.short_description]
        projects_with_short_desc = [p for p in projects if p.short_description]

        if len(projects_without_short_desc) > 0:
            projects_with_short_desc += summarize_descriptions(projects_without_short_desc)
        
        upsert_multiple(projects_with_short_desc)

        insert_multiple(run_id, weighted_projects)
        
        tables.logs.update(
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value="Results generated"
        )
        
    print(cb)

    return Response(
        status="done"
    )
