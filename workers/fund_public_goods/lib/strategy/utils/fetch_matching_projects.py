from fund_public_goods.db.entities import Projects
from fund_public_goods.db.tables.projects import fetch_projects_data
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.utils.get_top_matching_projects import get_top_matching_projects
from fund_public_goods.lib.strategy.utils.utils import get_latest_project_per_website
from fund_public_goods.workflows.egress_gitcoin.upsert import sanitize_url


def fetch_matching_projects(prompt: str) -> list[tuple[Projects, list[Answer]]]:
    fetched_projects = fetch_projects_data()
    answers_by_id = { project.id: answers for (project, answers) in fetched_projects }
    projects = [project for (project, _) in fetched_projects]
    
    deduplicated_projects = get_latest_project_per_website(projects)
    matching_projects = get_top_matching_projects(prompt, deduplicated_projects)[:10]
    
    matching_projects_with_answers = [(project, answers_by_id[project.id]) for project in matching_projects]
    
    return matching_projects_with_answers