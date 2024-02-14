from fund_public_goods.db.entities import Projects
from fund_public_goods.db.tables.projects import get_projects_without_keywords, upsert_multiple
from fund_public_goods.lib.strategy.utils.generate_keywords import generate_keywords


def batch_iterator(seq: list[Projects], size: int):
    """Yield successive chunks of size from seq."""
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


def generate_labels():
    projects = get_projects_without_keywords()
    
    for project_batch in batch_iterator(projects, 10):
        project_descriptions = [project.description for project in project_batch]
        projects_keywords = generate_keywords(project_descriptions)
        
        for i in range(len(projects_keywords)):
            project_batch[i].keywords = projects_keywords[i]
        
        print([p.title for p in project_batch])
        
        upsert_multiple(project_batch)
    
generate_labels()