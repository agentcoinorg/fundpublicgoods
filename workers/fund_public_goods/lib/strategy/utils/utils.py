from fund_public_goods.db.entities import Projects

from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.workflows.egress_gitcoin.upsert import sanitize_url


def get_latest_project_per_website(projects: list[Projects]) -> list[Projects]:
    projects_with_website_as_key: dict[str, Projects] = {}

    for project in projects:
        project_website = sanitize_url(project.website)
        if (project_website not in projects_with_website_as_key or
                project.updated_at > projects_with_website_as_key[project_website].updated_at):
            projects_with_website_as_key[project_website] = project

    projects_with_twitter_handle_as_key: dict[str, Projects] = {}
    for (website, project) in projects_with_website_as_key.items():
        if project.twitter:
            if (project.twitter not in projects_with_twitter_handle_as_key):
                projects_with_twitter_handle_as_key[project.twitter] = project
        else:
            projects_with_twitter_handle_as_key[website] = project

    return list(projects_with_twitter_handle_as_key.values())

def get_project_text(project_with_answers: tuple[Projects, list[Answer]]) -> str:
    (project, answers) = project_with_answers
    result = f"ID: {project.id} - Description: {project.description}\n"

    for answer in answers:
        result += f"  Question: {answer.question}\n"
        result += f"  Answer: {answer.answer}\n"

    return result


def remove_duplicate_projects(projects: list[tuple[Projects, list[Answer]]]) -> list[tuple[Projects, list[Answer]]]:
    seen = {}
    unique_projects = []

    for project in projects:
        if project[0].id not in seen:
            unique_projects.append(project)
            seen[project[0].id] = True

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