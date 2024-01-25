from typing import Any, Dict
from supabase import Client, PostgrestAPIResponse
import uuid
from fund_public_goods.db.entities import Projects


def insert(
    db: Client, row: Projects
) -> str:
    id = str(uuid.uuid4())
    db.table("projects").insert(
        {
            "id": id,
            "title": row.title,
            "description": row.description,
            "website": row.website,
        }
    ).execute()
    return id


def get_projects(db: Client) -> PostgrestAPIResponse[Dict[str, Any]]:
    return (
        db.table("projects")
        .select(
            "id, title, description, website, applications(id, recipient, round, answers)"
        )
        .execute()
    )
