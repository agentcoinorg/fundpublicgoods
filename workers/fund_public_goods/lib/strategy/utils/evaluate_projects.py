from typing import Any
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.utils.evaluate_project_impact_and_funding import evaluate_project_impact_and_funding
from fund_public_goods.lib.strategy.utils.evaluate_project_match import evaluate_project_match


def evaluate_projects(prompt: str, projects: list[Project]) -> list[dict[str, Any]]:
    projects_with_reports: list[tuple[Project, str]] = []
    
    for project in projects:
        match_report = evaluate_project_match(prompt, project)
        impact_and_funding_report = evaluate_project_impact_and_funding(prompt, project)
        
        report = f"## Match to user's prompt\n\n{match_report}\n\n{impact_and_funding_report}"
        
        projects_with_reports.append((project, report))
        
    return [{
        "project": project.model_dump(),
        "report": report
    } for (project, report) in projects_with_reports]