from supabase import Client
import uuid


def insert(db: Client, worker_id: str, prompt: str) -> str:
    id = str(uuid.uuid4())
    db.table("runs").insert(
        {"id": id, "worker_id": worker_id, "prompt": prompt}
    ).execute()
    return id


def get_prompt(db: Client, run_id: str) -> str:
    return (
        db.table("runs")
        .select("prompt")
        .eq("id", run_id)
        .limit(1)
        .single()
        .execute()
        .data
    )


def exists(db: Client, run_id: str) -> bool:
    try:
        run = db.table("runs").select("id").eq("id", run_id).execute()
        return len(run.data) > 0
    except Exception as error:
        print(error)
        return False
