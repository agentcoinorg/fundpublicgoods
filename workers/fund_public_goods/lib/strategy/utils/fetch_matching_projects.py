from fund_public_goods.db.tables.projects import fetch_projects_data
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.utils.get_top_matching_projects import get_top_matching_projects


def fetch_matching_projects(prompt: str) -> list[Project]:
    projects = fetch_projects_data()
    matching_projects = get_top_matching_projects(prompt, projects)[:10]
    
    return matching_projects