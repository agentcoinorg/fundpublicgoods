from fund_public_goods.db.entities import Projects
from fund_public_goods.db.tables.projects import get_all_projects, upsert_multiple
from fund_public_goods.lib.gitcoin.utils import fetch_project_applications
from fund_public_goods.lib.strategy.utils.categorize_project import categorize_project
from fund_public_goods.lib.strategy.utils.constants import PROJECT_CATEGORIES


def batch_iterator(seq: list[Projects], size: int):
    """Yield successive chunks of size from seq."""
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


def categorize_projects():
    projects_with_answers = get_all_projects()
    projects = [p for (p, _) in projects_with_answers if len(p.categories) == 0]
    
    print(len(projects))
    
    for project_batch in batch_iterator(projects, 10):
        project_descriptions = [project.description for project in project_batch]

        projects_categories = categorize_project(project_descriptions)
        
        for i in range(len(projects_categories)):
            current_categories = projects_categories[i]
            hallucinated_categories = [c for c in current_categories if c not in PROJECT_CATEGORIES and c != 'Uncategorized']
            
            if len(hallucinated_categories) > 0:
                print(f"{project_batch[i].title}: {hallucinated_categories}")
            else:
                project_batch[i].categories = projects_categories[i]
        
        print([p.title for p in project_batch])
        
        upsert_multiple(project_batch)
    
categorize_projects()