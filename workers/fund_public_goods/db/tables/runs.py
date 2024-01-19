from supabase import Client
import uuid


def insert(db: Client, worker_id: str, prompt: str) -> str:
    id = str(uuid.uuid4())
    db.table("runs").insert({
        "id": id,
        "worker_id": worker_id,
        "prompt": prompt
    }).execute()
    return id
