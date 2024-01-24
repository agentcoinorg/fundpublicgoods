from typing import Any, Dict
from supabase import Client, PostgrestAPIResponse
import uuid


def insert(
    db: Client, title: str, recipient: str, description: str, website: str
) -> str:
    id = str(uuid.uuid4())
    db.table("projects").insert(
        {
            "id": id,
            "title": title,
            "recipient": recipient,
            "description": description,
            "website": website,
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
