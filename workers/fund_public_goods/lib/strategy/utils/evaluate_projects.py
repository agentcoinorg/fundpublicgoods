from typing import Any
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.utils.evaluate_project import evaluate_project


def evaluate_projects(prompt: str, projects: list[Project]) -> list[dict[str, Any]]:
    projects_with_reports: list[tuple[Project, str]] = []
    
    for project in projects:
        report = evaluate_project(prompt, project)
        projects_with_reports.append((project, report))
        
    return [{
        "project": project.model_dump(),
        "report": report
    } for (project, report) in projects_with_reports]