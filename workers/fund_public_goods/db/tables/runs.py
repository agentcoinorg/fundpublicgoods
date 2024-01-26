from supabase import Client
import uuid
from fund_public_goods.db.entities import Runs


def insert(db: Client, row: Runs) -> str:
    id = str(uuid.uuid4())
    db.table("runs").insert({
        "id": id,
        "worker_id": str(row.worker_id),
        "prompt": row.prompt
    }).execute()
    return id


def get_prompt(db: Client, run_id: str) -> str:
    return (
        db.table("runs")
        .select("prompt")
        .eq("id", run_id)
        .limit(1)
        .single()
        .execute()
        .data["prompt"]
    )
