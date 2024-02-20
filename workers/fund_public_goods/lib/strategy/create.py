from fund_public_goods.db import tables, app_db
from fund_public_goods.db.entities import StepStatus, StepName, Logs
from fund_public_goods.db.tables.projects import upsert_multiple
from fund_public_goods.db.tables.runs import get_prompt
from fund_public_goods.db.tables.strategy_entries import insert_multiple
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores
from fund_public_goods.lib.strategy.utils.calculate_smart_rankings import calculate_smart_rankings
from fund_public_goods.lib.strategy.utils.fetch_matching_projects import fetch_matching_projects
from fund_public_goods.lib.strategy.utils.generate_impact_funding_reports import generate_impact_funding_reports
from fund_public_goods.lib.strategy.utils.generate_relevancy_reports import generate_relevancy_reports
from fund_public_goods.lib.strategy.utils.score_projects_impact_funding import score_projects_impact_funding
from fund_public_goods.lib.strategy.utils.score_projects_relevancy import score_projects_relevancy
from fund_public_goods.lib.strategy.utils.summarize_descriptions import summarize_descriptions
from supabase.lib.client_options import ClientOptions
from fastapi import Header, HTTPException
from pydantic import BaseModel
from typing import Optional, cast
from langchain_community.callbacks import get_openai_callback


def create(run_id: str, authorization: Optional[str] = Header(None)):
    with get_openai_callback() as cb:
        if authorization:
            supabase_auth_token = authorization.split(" ")[1]
        else:
            raise HTTPException(status_code=401, detail="Authorization header missing")

        if run_id == "":
            raise HTTPException(status_code=400, detail="RunID cannot be empty.")

        db = app_db.create(options=ClientOptions(postgrest_client_timeout=15))
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

        try:
            projects_with_answers = fetch_matching_projects(prompt)
            tables.logs.update(
                status=StepStatus.COMPLETED,
                log_id=log_ids[StepName.FETCH_PROJECTS],
                value=f"Found {len(projects_with_answers)} projects related to '{prompt}'",
            )
        except Exception as error:
            details = f"An error occurred: {type(error).__name__} - {str(error)} "
            tables.logs.update(
                status=StepStatus.ERRORED,
                log_id=log_ids[StepName.FETCH_PROJECTS],
                value=details
            )
            print(error)
            raise HTTPException(status_code=400, detail=details)

        try:
            tables.logs.update(
                status=StepStatus.IN_PROGRESS,
                log_id=log_ids[StepName.EVALUATE_PROJECTS],
                value=None,
            )
            
            # Only generate impact & funding reports and scores for those that need it
            
            projects_without_funding_impact_reports = [(p, answers) for (p, answers) in projects_with_answers if not p.impact_funding_report]
            projects_with_impact_funding_reports = [(p, answers) for (p, answers) in projects_with_answers if p.impact_funding_report]
            
            if len(projects_without_funding_impact_reports) > 0:
                impact_funding_reports = generate_impact_funding_reports(projects_without_funding_impact_reports)
                projects_with_new_reports_and_answers = [projects_without_funding_impact_reports[i] for i in range(len(impact_funding_reports))]
                
                for i in range(len(projects_with_new_reports_and_answers)):
                    projects_with_new_reports_and_answers[i][0].impact_funding_report = impact_funding_reports[i]

                impact_funding_scores = score_projects_impact_funding([p for (p, _) in projects_with_new_reports_and_answers])
                
                for i in range(len(impact_funding_scores)):
                    projects_with_new_reports_and_answers[i][0].impact = impact_funding_scores[i].impact
                    projects_with_new_reports_and_answers[i][0].funding_needed = impact_funding_scores[i].funding_needed
                
                print([p.title for (p, _) in projects_with_new_reports_and_answers])
                upsert_multiple([p for (p, _) in projects_with_new_reports_and_answers])
                
                projects_with_impact_funding_reports += projects_with_new_reports_and_answers
            
            tables.logs.update(
                status=StepStatus.COMPLETED,
                log_id=log_ids[StepName.EVALUATE_PROJECTS],
                value=f"Generated impact & funding needs reports for {len(projects_with_impact_funding_reports)} projects",
            )
        except Exception as error:
            details = f"An error occurred: {type(error).__name__} - {str(error)} "
            tables.logs.update(
                status=StepStatus.ERRORED,
                log_id=log_ids[StepName.EVALUATE_PROJECTS],
                value=details
            )
            print(error)
            raise HTTPException(status_code=400, detail=details)

        try:
            tables.logs.update(
                status=StepStatus.IN_PROGRESS,
                log_id=log_ids[StepName.ANALYZE_FUNDING],
                value=None,
            )
            
            relevancy_reports = generate_relevancy_reports(prompt, projects_with_impact_funding_reports)
            projects_with_relevancy_reports = [(projects_with_impact_funding_reports[i][0], relevancy_reports[i]) for i in range(len(relevancy_reports))]
            full_reports = [f"{relevancy_reports[i]}\n\n{projects_with_relevancy_reports[i][0].impact_funding_report}" for i in range(len(relevancy_reports))]
            
            relevancy_scores = score_projects_relevancy(projects_with_relevancy_reports, prompt)
            
            project_scores = [ProjectScores(
                    project_id=relevancy_scores[i].project_id,
                    prompt_match=relevancy_scores[i].prompt_match,
                    impact=impact_funding_scores[i].impact,
                    funding_needed=impact_funding_scores[i].funding_needed
                ) for i in range(len(relevancy_scores)
            )]
            
            projects_with_scores = [(projects_with_relevancy_reports[i][0], project_scores[i]) for i in range(len(project_scores))]
            smart_ranked_projects = calculate_smart_rankings(projects_with_scores)

            tables.logs.update(
                status=StepStatus.COMPLETED,
                log_id=log_ids[StepName.ANALYZE_FUNDING],
                value=f"Computed smart rankings for {len(smart_ranked_projects)} projects",
            )
        except Exception as error:
            f"An error occurred: {type(error).__name__} - {str(error)} "
            tables.logs.update(
                status=StepStatus.ERRORED,
                log_id=log_ids[StepName.ANALYZE_FUNDING],
                value=details
            )
            print(error)
            raise HTTPException(status_code=400, detail=details)


        tables.logs.update(
            status=StepStatus.IN_PROGRESS,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value=None
        )

        projects_without_short_desc = [p for (p, _) in projects_with_scores if not p.short_description]
        projects_with_short_desc = [p for (p, _) in projects_with_scores if p.short_description]

        if len(projects_without_short_desc) > 0:
            projects_with_short_desc += summarize_descriptions(projects_without_short_desc)
        
        upsert_multiple(projects_with_short_desc)
        
        ranked_projects_with_reports = [(smart_ranked_projects[i], full_reports[i]) for i in range(len(smart_ranked_projects))]

        insert_multiple(run_id, ranked_projects_with_reports)
        
        tables.logs.update(
            status=StepStatus.COMPLETED,
            log_id=log_ids[StepName.SYNTHESIZE_RESULTS],
            value="Results generated"
        )
        
    print(cb)

