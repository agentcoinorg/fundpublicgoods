from typing import Any
from fund_public_goods.db.entities import Projects
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores
from fund_public_goods.lib.strategy.models.smart_ranked_project import SmartRankedProject


PROMPT_MATCH_WEIGHT = 1/3
IMPACT_WEIGHT = 1/3
FUNDING_NEEDED_WEIGHT = 1/3

def calculate_smart_rankings(projects_with_scores: list[tuple[Projects, ProjectScores]]) -> list[SmartRankedProject]:
    smart_ranked_projects: list[dict[str, Any]] = []
    
    for (project, project_scores) in projects_with_scores:
        smart_ranking = (
            (project_scores.prompt_match * PROMPT_MATCH_WEIGHT) +
            (project_scores.impact * IMPACT_WEIGHT) +
            (project_scores.funding_needed * FUNDING_NEEDED_WEIGHT)
        )
        
        smart_ranked_projects.append(
            {
                "project": project,
                "scores": project_scores,
                "smart_ranking": smart_ranking
            }
        )
        
    ranked_projects: list[SmartRankedProject] = [
        SmartRankedProject(
            project=smart_ranked_project["project"],
            scores=smart_ranked_project["scores"],
            smartRanking=round(smart_ranked_project["smart_ranking"], 2)
        ) for smart_ranked_project in smart_ranked_projects
    ]
        
    return ranked_projects
