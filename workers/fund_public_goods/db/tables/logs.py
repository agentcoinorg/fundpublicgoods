from typing import Literal
from supabase import Client
import datetime
from fund_public_goods.db.entities import StepStatus, StepName

def create(
    db: Client,
    run_id: str,
    step_name: StepName,
):
    return db.table("logs").insert({
        "run_id": run_id,
        "step_name": step_name.value,
        "status": StepStatus.NOT_STARTED.value
    }).execute()

def update(
    db: Client,
    log_id: str,
    status: Literal[StepStatus.IN_PROGRESS, StepStatus.COMPLETED, StepStatus.ERRORED],
    value: str | None
):
    ended_at = None
    if status == StepStatus.COMPLETED or status == StepStatus.ERRORED:
       ended_at = datetime.datetime.now().isoformat()

    return db.table("logs").update({
        "status": status.value,
        "value": value,
        "ended_at": ended_at
    }).eq("id", log_id).execute()
