import datetime
import json
from fund_public_goods.db.entities import GitcoinProjects, GitcoinApplications, GitcoinIndexingJobs
from fund_public_goods.db.client import create_admin
from fund_public_goods.db import tables, entities

def upsert_project(project: GitcoinProjects, created_at: int):
    db = create_admin("indexing")

    db.table("gitcoin_projects").upsert({
        "id": project.id,
        "protocol": project.protocol,
        "pointer": project.pointer,
        "data": project.data
    }).execute()

    result = tables.projects.get(project.id)

    if result and result.updated_at > created_at:
        return

    row = entities.Projects(
        id=project.id,
        updated_at=created_at,
        title=project.data["title"],
        description=project.data["description"],
        website=project.data["website"],
        twitter=project.data["projectTwitter"],
        logo=project.data["logoImg"],
    )

    if result == None:
        tables.projects.insert(row)
    else:
        tables.projects.upsert(row)

def save_application(app: GitcoinApplications, network: int):
    db = create_admin("indexing")

    db.table("gitcoin_applications").insert({
        "id": app.id,
        "created_at": app.created_at,
        "protocol": app.protocol,
        "pointer": app.pointer,
        "round_id": app.round_id,
        "project_id": app.project_id,
        "data": app.data
    }).execute()

    tables.applications.insert(entities.Applications(
        id=app.id,
        created_at=app.created_at,
        recipient=app.data["application"]["recipient"],
        network=network,
        round=app.round_id,
        answers=json.dumps(app.data["application"]["answers"]),
        project_id=app.project_id
    ))

def get_non_running_job() -> GitcoinIndexingJobs | None: 
    db = create_admin("indexing")
    
    result = (db.table("gitcoin_indexing_jobs")
        .select("id", "url", "is_running", "skip_rounds", "skip_projects", "network_id")
        .order("last_updated_at", desc=False)
        .eq("is_running", False)
        .eq("is_failed", False)
        .limit(1)
        .execute())

    if not result.data:
        return None

    data = result.data[0]

    return GitcoinIndexingJobs(
        id = data["id"],
        url = data["url"],
        network_id = data["network_id"],
        is_running = data["is_running"],
        skip_rounds = data["skip_rounds"],
        skip_projects = data["skip_projects"]
    )

def is_any_job_running() -> bool: 
    db = create_admin("indexing")
    
    result = (db.table("gitcoin_indexing_jobs")
        .select("id")
        .eq("is_running", True)
        .eq("is_failed", False)
        .limit(1)
        .execute())
    
    return len(result.data) > 0

def start_job(job_id: str) -> None:
    db = create_admin("indexing")

    (db.table("gitcoin_indexing_jobs")
        .update({
            "is_running": True,
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())

def stop_job(job_id: str) -> None:
    db = create_admin("indexing")

    (db.table("gitcoin_indexing_jobs")
        .update({
            "is_running": False
        })
        .eq("id", job_id)
        .execute())

def update_job_progress(job_id: str, skip_rounds: int, skip_projects: int) -> None:
    db = create_admin("indexing")

    (db.table("gitcoin_indexing_jobs")
        .update({
            "skip_rounds": skip_rounds,
            "skip_projects": skip_projects,
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())

def stop_and_mark_job_as_failed(job_id: str, error: object):
    db = create_admin("indexing")

    (db.table("gitcoin_indexing_jobs")
        .update({
            "is_running": False,
            "is_failed": True,
            "error": json.dumps(error),
            "last_updated_at": datetime.datetime.utcnow().isoformat()
        })
        .eq("id", job_id)
        .execute())
