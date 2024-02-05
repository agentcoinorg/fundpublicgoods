from typing import Literal, Any
import datetime
from supabase import PostgrestAPIResponse
from fund_public_goods.db.client import create_admin
from fund_public_goods.db.entities import Logs, StepStatus, StepName


def insert_multiple(run_id: str):
    db = create_admin()

    return (
        db.table("logs")
        .insert(
            [
                {
                    "run_id": run_id,
                    "status": (
                        StepStatus.IN_PROGRESS.value
                        if step_name == StepName.FETCH_PROJECTS
                        else StepStatus.NOT_STARTED.value
                    ),
                    "step_name": step_name.value,
                }
                for step_name in StepName
            ]
        )
        .execute()
    )


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


def get(run_id: str) -> list[Logs] | None:
    db = create_admin()
    result: PostgrestAPIResponse[Logs] = (
        db.table("logs").select("*").eq("run_id", run_id).execute()
    )
    if not result.data:
        return None
    return result.data
