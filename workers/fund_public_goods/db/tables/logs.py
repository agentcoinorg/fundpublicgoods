from typing import Literal
import datetime
from fund_public_goods.db.client import create_admin
from fund_public_goods.db.entities import StepStatus, StepName


def create(
    run_id: str,
    step_name: StepName,
):
    db = create_admin()
    return db.table("logs").insert({
        "run_id": run_id,
        "step_name": step_name.value,
        "status": StepStatus.NOT_STARTED.value
    }).execute()

def update(
    log_id: str,
    status: Literal[StepStatus.IN_PROGRESS, StepStatus.COMPLETED, StepStatus.ERRORED],
    value: str | None
):
    db = create_admin()
    ended_at = None
    if status == StepStatus.COMPLETED or status == StepStatus.ERRORED:
       ended_at = datetime.datetime.now().isoformat()

    return db.table("logs").update({
        "status": status.value,
        "value": value,
        "ended_at": ended_at
    }).eq("id", log_id).execute()
