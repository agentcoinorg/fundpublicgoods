from fund_public_goods.db.entities import Projects
from fund_public_goods.db.tables.projects import get_projects_without_categories, upsert_multiple
from fund_public_goods.lib.strategy.utils.categorize_project import categorize_project


def batch_iterator(seq: list[Projects], size: int):
    """Yield successive chunks of size from seq."""
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


def categorize_projects():
    projects = get_projects_without_categories()
    
    for project_batch in batch_iterator(projects, 10):
        project_descriptions = [project.description for project in project_batch]
        projects_categories = categorize_project(project_descriptions)
        
        for i in range(len(projects_categories)):
            project_batch[i].categories = projects_categories[i]
        
        print([p.title for p in project_batch])
        
        upsert_multiple(project_batch)
    
categorize_projects()