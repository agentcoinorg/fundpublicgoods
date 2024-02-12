from typing import Any, Dict
from fund_public_goods.lib.strategy.models.answer import Answer
from supabase import PostgrestAPIResponse
from fund_public_goods.db.entities import Projects
from fund_public_goods.db.app_db import create_admin


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
        "short_description": row.short_description,
        "impact": row.impact,
        "funding_needed": row.funding_needed,
        "logo": row.logo
    }).execute()
    
def upsert_multiple(
    rows: list[Projects]
):
    db = create_admin()
    db.table("projects").upsert([{
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
        "twitter": row.twitter,
        "short_description": row.short_description,
        "impact": row.impact,
        "funding_needed": row.funding_needed,
        "logo": row.logo
    } for row in rows]).execute()

def get(
    project_id: str
) -> Projects | None:
    db = create_admin()
    result = (db.table("projects")
        .select("id", "updated_at", "title", "description", "short_description", "funding_needed", "impact", "website", "twitter", "logo")
        .eq("id", project_id)
        .execute())

    if not result.data:
        return None

    data = result.data[0]

    return Projects(
        id=data["id"],
        updatedAt=data["updated_at"],
        title=data["title"],
        description=data["description"],
        website=data["website"],
        twitter=data["twitter"],
        shortDescription=data["short_description"],
        fundingNeeded=data["funding_needed"],
        impact=data["impact"],
        logo=data["logo"]
    )

def get_projects() -> PostgrestAPIResponse[Dict[str, Any]]:
    db = create_admin()
    return (
        db.table("projects")
        .select(
            "id, updated_at, title, description, website, short_description, funding_needed, impact, twitter, logo, applications(id, recipient, round, answers)"
        )
        .execute()
    )

def fetch_projects_data() -> list[tuple[Projects, list[Answer]]]:
    response = get_projects()
    
    projects_with_answers: list[tuple[Projects, list[Answer]]] = []

    for item in response.data:
        answers: list[Answer] = []

        for application in item.get("applications", []):
            for answer in application.get("answers", []):
                answers.append(Answer(
                    question=answer.get("question", ""),
                    answer=answer.get("answer", None)
                ))
        
        # Remove all None values
        project_data = {k: v for k, v in item.items() if v is not None}

        project = Projects(
            id=project_data.get("id", ""),
            title=project_data.get("title", ""),
            description=project_data.get("description", ""),
            updatedAt=project_data.get("updated_at", None),
            website=project_data.get("website", ""),
            twitter=project_data.get("twitter", ""),
            logo=project_data.get("logo", ""),
            shortDescription=project_data.get("short_description", None),
            fundingNeeded=project_data.get("funding_needed", None),
            impact=project_data.get("impact", None),
        )
        
        projects_with_answers.append((project, answers))

    return projects_with_answers
