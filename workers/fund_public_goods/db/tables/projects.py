from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.db.entities import Projects
from fund_public_goods.db.client import create_admin


def insert(
    row: Projects
):
    db = create_admin()
    db.table("projects").insert({
        "id": row.id,
        "website": row.website,
    }).execute()

def upsert(
    row: Projects
):
    db = create_admin()
    db.table("projects").upsert({
        "id": row.id,
        "website": row.website,
    }).execute()

def get(
    project_id: str
) -> Projects | None:
    db = create_admin()
    result = (db.table("projects")
        .select("id", "website")
        .eq("id", project_id)
        .execute())

    if not result.data:
        return None

    data = result.data[0]

    return Projects(
        id=data["id"],
        website=data["website"],
    )

def get_projects() -> list[Projects]:
    db = create_admin()
    data = (
        db.table("projects")
        .select(
            "id, website"
        )
        .execute()
    ).data
    
    return [Projects(**project) for project in data]

def fetch_projects_data() -> list[Project]:
    response = get_projects() # TODO: this doesn't return all the bottom info anymore
    
    projects: list[Project] = []

    for item in response.data:
        answers: list[Answer] = []

        for application in item.get("applications", []):
            for answer in application.get("answers", []):
                answers.append(Answer(
                    question=answer.get("question", ""),
                    answer=answer.get("answer", None)
                ))
        
        project = Project(
            id=item.get("id", ""),
            title=item.get("title", ""),
            description=item.get("description", ""),
            website=item.get("website", ""),
            twitter=item.get("twitter", ""),
            logo=item.get("logo", ""),
            answers=answers,
        )
        
        projects.append(project)

    return projects
