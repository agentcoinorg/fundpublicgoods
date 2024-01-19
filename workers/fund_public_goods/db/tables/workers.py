from supabase import Client
import uuid


def insert(db: Client) -> str:
    id = str(uuid.uuid4())
    db.table("workers").insert({
        "id": id
    }).execute()
    return id
