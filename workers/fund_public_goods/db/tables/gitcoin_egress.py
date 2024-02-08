import datetime
import json
from fund_public_goods.db.entities import GitcoinProjects, GitcoinApplications, GitcoinEgressJobs
from fund_public_goods.db.app_db import create_admin
from fund_public_goods.db import tables, entities
from pydantic import BaseModel

class AppWithProject(BaseModel):
    app: GitcoinApplications
    project: GitcoinProjects

def get_application_range(first: int, skip: int) -> list[dict]:
    db = create_admin("indexing")

    result = (db.table("gitcoin_applications")
        .select(
            "id", 
            "network",
            "created_at", 
            "protocol", 
            "pointer", 
            "round_id", 
            "project_id", 
            "data", 
            "gitcoin_projects(id, protocol, pointer, data)"
        )
        .order("created_at", desc=False)
        .offset(skip)
        .limit(first)
        .execute())
    
    return [
        AppWithProject(
            app = GitcoinApplications(
                id = data["id"],
                network = data["network"],
                created_at = data["created_at"],
                protocol = data["protocol"],
                pointer = data["pointer"],
                round_id = data["round_id"],
                project_id = data["project_id"],
                data = json.dumps(data["data"])
            ), 
            project = GitcoinProjects(
                id = data["gitcoin_projects"]["id"],
                protocol = data["gitcoin_projects"]["protocol"],
                pointer = data["gitcoin_projects"]["pointer"],
                data = json.dumps(data["gitcoin_projects"]["data"])
            )
        # We need to dump the model with `round_trip=True` 
        # to avoid not being able to parse it back because of the `data` fields and their Json types
        ).model_dump(round_trip=True) for data in result.data
    ]

def get_non_running_job() -> GitcoinEgressJobs | None: 
    db = create_admin("indexing")
    
    result = (db.table("gitcoin_egress_jobs")
        .select("id", "is_running", "skip_applications")
        .order("last_updated_at", desc=False)
        .eq("is_running", False)
        .eq("is_failed", False)
        .limit(1)
        .execute())

    if not result.data:
        return None

    data = result.data[0]

    return GitcoinEgressJobs(
        id = data["id"],
        is_running = data["is_running"],
        skip_projects = data["skip_applications"]
    )

def is_any_job_running() -> bool: 
    db = create_admin("indexing")
    
    result = (db.table("gitcoin_egress_jobs")
        .select("id")
        .eq("is_running", True)
        .eq("is_failed", False)
        .limit(1)
        .execute())
    
    return len(result.data) > 0

def start_job(job_id: str) -> None:
    db = create_admin("indexing")

    (db.table("gitcoin_egress_jobs")
        .update({
            "is_running": True,
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())

def stop_job(job_id: str) -> None:
    db = create_admin("indexing")

    (db.table("gitcoin_egress_jobs")
        .update({
            "is_running": False
        })
        .eq("id", job_id)
        .execute())

def update_job_progress(job_id: str, skip_applications: int) -> None:
    db = create_admin("indexing")

    (db.table("gitcoin_egress_jobs")
        .update({
            "skip_applications": skip_applications,
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())

def stop_and_mark_job_as_failed(job_id: str, error: object):
    db = create_admin("indexing")

    (db.table("gitcoin_egress_jobs")
        .update({
            "is_running": False,
            "is_failed": True,
            "error": json.dumps(error),
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())
