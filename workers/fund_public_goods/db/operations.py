import datetime
import json
from fund_public_goods.gitcoin.models import GitcoinIndexingJob, ProjectApplicationInfo, ProjectInfo
from .client import create_admin

def upsert_project(app: ProjectInfo):
    db = create_admin()

    db.table("gitcoin_projects").upsert({
        "id": app.id,
        "protocol": app.protocol,
        "pointer": app.pointer,
        "data": app.data
    }).execute()
    

def save_application(app: ProjectApplicationInfo):
    db = create_admin()
    
    db.table("gitcoin_applications").insert({
        "id": app.id,
        "protocol": app.protocol,
        "pointer": app.pointer,
        "round_id": app.round_id,
        "project_id": app.project_id,
        "data": app.data
    }).execute()

def get_non_running_job() -> GitcoinIndexingJob | None: 
    db = create_admin()
    
    result = (db.table("gitcoin_indexing_jobs")
        .select("id", "url", "is_running", "skip_rounds", "skip_projects")
        .order("last_updated_at", desc=False)
        .eq("is_running", False)
        .eq("is_failed", False)
        .limit(1)
        .execute())
    
    if not result.data:
        return None

    return GitcoinIndexingJob (
        id = result.data[0]["id"],
        url = result.data[0]["url"],
        is_running = result.data[0]["is_running"],
        skip_rounds = result.data[0]["skip_rounds"],
        skip_projects = result.data[0]["skip_projects"]
    )

def is_any_job_running() -> bool: 
    db = create_admin()
    
    result = (db.table("gitcoin_indexing_jobs")
        .select("id")
        .eq("is_running", True)
        .eq("is_failed", False)
        .limit(1)
        .execute())
    
    return len(result.data) > 0

def start_job(job_id: str) -> None:
    db = create_admin()

    (db.table("gitcoin_indexing_jobs")
        .update({
            "is_running": True,
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())
    
def stop_job(job_id: str) -> None:
    db = create_admin()

    (db.table("gitcoin_indexing_jobs")
        .update({
            "is_running": False
        })
        .eq("id", job_id)
        .execute())
    
def update_job_progress(job_id: str, skip_rounds: int, skip_projects: int) -> None:
    db = create_admin()

    (db.table("gitcoin_indexing_jobs")
        .update({
            "skip_rounds": skip_rounds,
            "skip_projects": skip_projects,
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())
    
def stop_and_mark_job_as_failed(job_id: str, error: dict) -> None:
    db = create_admin()

    (db.table("gitcoin_indexing_jobs")
        .update({
            "is_running": False,
            "is_failed": True,
            "error": json.dumps(error),
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())