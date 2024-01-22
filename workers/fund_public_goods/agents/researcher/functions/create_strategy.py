from fund_public_goods.agents.researcher.models.weighted_project import WeightedProject
from researcher.functions.assign_weights import assign_weights
from researcher.functions.evaluate_projects import evaluate_projects
from researcher.functions.fetch_projects import fetch_projects
from langchain_community.callbacks import get_openai_callback

def create_strategy(prompt: str) -> list[WeightedProject]:
    projects = fetch_projects(directory="./project_data")
    
    with get_openai_callback() as cb:
        evaluated_projects = evaluate_projects(prompt=prompt, projects=projects)
        weighted_projects = assign_weights(evaluated_projects)
        
    print(cb)
    return weighted_projects