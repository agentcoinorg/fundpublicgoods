import math
from typing import Any
from fund_public_goods.db.entities import Projects
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores
from fund_public_goods.lib.strategy.models.weighted_project import WeightedProject


PROMPT_MATCH_WEIGHT = 1/3
IMPACT_WEIGHT = 1/3
FUNDING_NEEDED_WEIGHT = 1/3

def calculate_weights(projects_with_reports: list[tuple[Projects, str]], projects_scores: list[ProjectScores]) -> list[WeightedProject]:
    projects_by_id = { project_with_report[0].id: project_with_report for project_with_report in projects_with_reports }
    smart_ranked_projects: list[dict[str, Any]] = []
    
    for project_scores in projects_scores:
        smart_ranking = (
            (project_scores.prompt_match * PROMPT_MATCH_WEIGHT) +
            (project_scores.impact * IMPACT_WEIGHT) +
            (project_scores.funding_needed * FUNDING_NEEDED_WEIGHT)
        )
        
        (project, report) = projects_by_id[project_scores.project_id]
        
        smart_ranked_projects.append(
            {
                "project": project,
                "report": report,
                "scores": project_scores,
                "smart_ranking": smart_ranking
            }
        )
    total_score = math.fsum([round(project["smart_ranking"], 2) for project in smart_ranked_projects])

    weighted_projects: list[WeightedProject] = [
        WeightedProject(
            project=smart_ranked_project["project"],
            report=smart_ranked_project["report"],
            scores=smart_ranked_project["scores"],
            smart_ranking=round(smart_ranked_project["smart_ranking"], 2),
            weight=(round(smart_ranked_project["smart_ranking"], 2) / total_score),
        ) for smart_ranked_project in smart_ranked_projects
    ]

    return weighted_projects
