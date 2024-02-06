from typing import Optional
from fund_public_goods.lib.strategy.models.project import Project


def stringify_projects(projects: list[Project], separator: str) -> str:
    project_strings = []

    for i in range(len(projects)):
        project_str = get_project_text(project=projects[i], index=i)
        project_strings.append(project_str)

    return separator.join(project_strings)


def get_project_text(project: Project, index: Optional[int] = None) -> str:
    id_to_use = index if index is not None else project.id
    result = f"ID: {id_to_use} - Description: {project.description}\n"

    for answer in project.answers:
        result += f"  Question: {answer.question}\n"
        result += f"  Answer: {answer.answer}\n"

    return result


def remove_duplicate_projects(projects: list[Project]) -> list[Project]:
    seen = {}
    unique_projects = []

    for project in projects:
        if project.id not in seen:
            unique_projects.append(project)
            seen[project.id] = True

    return unique_projects

def adjust_weights(weights: list[float]) -> list[float]:
    # Adjust initial weights to make their sum equal to target_sum
    excess = (sum(weights) - 1.0) / len(weights)
    adjusted_weights = [weight - excess for weight in weights]
    
    # Round adjusted weights to specified precision
    rounded_weights = [round(weight, 2) for weight in adjusted_weights]
    
    # Correct for any discrepancies caused by rounding
    correction = round(1 - sum(rounded_weights), 2)
    for i in range(len(rounded_weights)):
        if correction == 0:
            break
        adjustment = round(min(max(correction, -0.01), 0.01), 2)
        rounded_weights[i] += adjustment
        correction = round(correction - adjustment, 2)
    
    return rounded_weights