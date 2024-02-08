from typing import Any
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.utils.evaluate_project_impact_and_funding import evaluate_project_impact_and_funding
from fund_public_goods.lib.strategy.utils.evaluate_project_match import evaluate_project_match


def evaluate_project(prompt: str, project: Project) -> str:
    match_report = evaluate_project_match(prompt, project)
    impact_and_funding_report = evaluate_project_impact_and_funding(prompt, project)
    
    report = f"## Match to user's prompt\n\n{match_report}\n\n{impact_and_funding_report}"
    
    return report