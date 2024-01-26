from typing import Any, Dict
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.models.project import Project
from supabase import Client, PostgrestAPIResponse
from fund_public_goods.db.entities import Projects


def insert(
    db: Client,
    row: Projects
):
    db.table("projects").insert({
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
    }).execute()

def upsert(
    db: Client,
    row: Projects
):
    db.table("projects").upsert({
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
    }).execute()

def get(
    db: Client,
    project_id: str
) -> Projects | None:
    result = (db.table("projects")
        .select("id", "updated_at", "title", "description", "website")
        .eq("id", project_id)
        .execute())

    if not result.data:
        return None

    data = result.data[0]

    return Projects(
        id=data["id"],
        updated_at=data["updated_at"],
        title=data["title"],
        description=data["description"],
        website=data["website"]
    )

def get_projects(db: Client) -> PostgrestAPIResponse[Dict[str, Any]]:
    return (
        db.table("projects")
        .select(
            "id, updated_at, title, description, website, applications(id, recipient, round, answers)"
        )
        .execute()
    )

def fetch_projects_data(supabase: Client) -> list[Project]:
    response = get_projects(supabase)
    
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
            answers=answers,
        )
        
        projects.append(project)

    return projects