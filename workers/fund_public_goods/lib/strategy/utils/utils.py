from fund_public_goods.agents.researcher.models.project import Project


def stringify_projects(projects: list[Project], separator: str) -> str:
    project_strings = []

    for project in projects:
        project_str = get_project_text(project=project)
        project_strings.append(project_str)

    return separator.join(project_strings)


def get_project_text(project: Project) -> str:
    result = f"ID: {project.id} - Description: {project.description}\n"
        
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