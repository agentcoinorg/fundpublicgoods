from typing import Any, Dict
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
