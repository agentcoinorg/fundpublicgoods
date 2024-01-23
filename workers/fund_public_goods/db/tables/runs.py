from supabase import Client
import uuid
from ..client import create_admin


def insert(db: Client, worker_id: str, prompt: str) -> str:
    id = str(uuid.uuid4())
    db.table("runs").insert(
        {"id": id, "worker_id": worker_id, "prompt": prompt}
    ).execute()
    return id


def get_prompt(run_id: str) -> str:
    db = create_admin()
    return (
        db.table("runs")
        .select("prompt")
        .eq("id", run_id)
        .limit(1)
        .single()
        .execute()
        .data
    )
