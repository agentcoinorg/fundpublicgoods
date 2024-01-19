from supabase import Client
import uuid


def insert(
    db: Client,
    title: str,
    recipient: str,
    description: str,
    website: str
) -> str:
    id = str(uuid.uuid4())
    db.table("projects").insert({
        "id": id,
        "title": title,
        "recipient": recipient,
        "description": description,
        "website": website
    }).execute()
    return id
