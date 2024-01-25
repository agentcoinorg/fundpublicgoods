from typing import Literal
from supabase import Client
import datetime

def create(
    db: Client,
    run_id: str,
    step_name: str,
):
    return db.table("logs").insert({
        "run_id": run_id,
        "step_name": step_name,
    }).execute()
    
def update(
    db: Client,
    log_id: str,
    status: Literal["IN_PROGRESS", "COMPLETED", "ERRORED"],
    value: str | None
):
    ended_at = None
    if status == "COMPLETED" or status == "ERRORED":
       ended_at = datetime.datetime.now().isoformat()
    
    return db.table("logs").update({
        "status": status,
        "value": value,
        "ended_at": ended_at
    }).eq("id", log_id).execute()