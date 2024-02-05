from typing import Any, Dict
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.models.project import Project
from supabase import PostgrestAPIResponse
from fund_public_goods.db.entities import Projects
from fund_public_goods.db.client import create_admin


def insert(
    row: Projects
):
    db = create_admin()
    db.table("projects").insert({
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
        "twitter": row.twitter,
        "logo": row.logo
    }).execute()

def upsert(
    row: Projects
):
    db = create_admin()
    db.table("projects").upsert({
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
        "twitter": row.twitter,
        "logo": row.logo
    }).execute()

def get(
    project_id: str
) -> Projects | None:
    db = create_admin()
    result = (db.table("projects")
        .select("id", "updated_at", "title", "description", "website", "twitter", "logo")
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
        website=data["website"],
        twitter=data["twitter"],
        logo=data["logo"]
    )

def get_projects() -> PostgrestAPIResponse[Dict[str, Any]]:
    db = create_admin()
    return (
        db.table("projects")
        .select(
            "id, updated_at, title, description, website, twitter, logo, applications(id, recipient, round, answers)"
        )
        .execute()
    )

def fetch_projects_data() -> list[Project]:
    response = get_projects()
    
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
