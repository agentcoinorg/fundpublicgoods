from typing import Any, Dict
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.models.project import Project
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

def get_all(
    project_ids: list[str]
) -> list[Projects]:
    db = create_admin()
    result = (db.table("projects")
        .select("id", "updated_at", "title", "description", "website", "twitter", "logo")
        .in_("id", project_ids)
        .execute())
    
    return [
        Projects(
            id=data["id"],
            updated_at=data["updated_at"],
            title=data["title"],
            description=data["description"],
            website=data["website"],
            twitter=data["twitter"],
            logo=data["logo"]
        ) for data in result.data
    ]

def get_slim(
    project_ids: list[str]
) -> list[tuple[str, str]]:
    db = create_admin()
    result = (db.table("projects")
        .select("id", "description")
        .in_("id", project_ids)
        .execute())
    
    return [
        (data["id"], data["description"])
        for data in result.data
    ]
