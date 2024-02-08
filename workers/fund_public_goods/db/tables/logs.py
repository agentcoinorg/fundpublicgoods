import datetime
from typing import Literal, Dict, Any
from supabase import PostgrestAPIResponse
from fund_public_goods.db.client import create_admin, Client
from fund_public_goods.db.entities import Logs, StepStatus


def insert_multiple(logs: list[Logs]):
    db = create_admin()

    return (
        db.table("logs")
        .insert(
            [
                {
                    "run_id": str(log.run_id),
                    "status": log.status,
                    "step_name": log.step_name,
                    "value": log.value
                }
                for log in logs
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


def get(run_id: str, db: Client = create_admin()) -> list[Logs] | None:
    result: PostgrestAPIResponse[Dict[str, Any]] = (
        db.table("logs").select("*").eq("run_id", run_id).execute()
    )
    if not result.data:
        return None
    data = result.data

    return [
        Logs(
            id=log["id"],
            run_id=log["run_id"],
            created_at=log["created_at"],
            ended_at=log["ended_at"],
            status=log["status"],
            step_name=log["step_name"],
            value=log["value"],
        )
        for log in data
    ]
