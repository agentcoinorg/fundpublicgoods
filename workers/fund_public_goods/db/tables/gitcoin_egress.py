import datetime
import json
from fund_public_goods.db.entities import GitcoinProjects, GitcoinApplications, GitcoinEgressJobs
from fund_public_goods.db.client import create_admin
from fund_public_goods.db import tables, entities

def get_application_range(first: int, skip: int) -> list[tuple[GitcoinApplications, GitcoinProjects]]:
    db = create_admin("indexing")

    result = (db.table("gitcoin_applications")
        .select(
            "id", 
            "created_at", 
            "protocol", 
            "pointer", 
            "round_id", 
            "project_id", 
            "data", 
            "gitcoin_projects(id, protocol, pointer, data)"
        )
        .order("created_at", desc=False)
        .skip(skip)
        .limit(first)
        .execute())
    
    return [
        (
            GitcoinApplications(
                id = data["id"],
                network = data["network"],
                created_at = data["created_at"],
                protocol = data["protocol"],
                pointer = data["pointer"],
                round_id = data["round_id"],
                project_id = data["project_id"],
                data = json.loads(data["data"])
            ), 
            GitcoinProjects(
                id = data["gitcoin_projects"]["id"],
                protocol = data["gitcoin_projects"]["protocol"],
                pointer = data["gitcoin_projects"]["pointer"],
                data = json.loads(data["gitcoin_projects"]["data"])
            )
        ) for data in result.data
    ]

def upsert_project(project: GitcoinProjects):
    row = entities.Projects(
        id=project.id,
        updated_at=datetime.datetime.utcnow().isoformat(),
        title=project.data["title"],
        description=project.data["description"],
        website=project.data["website"],
        twitter=project.data.get("projectTwitter", ""),
        logo=project.data.get("logoImg", ""),
    )

    tables.projects.upsert(row)

def upsert_application(app: GitcoinApplications):
    tables.applications.upsert(entities.Applications(
        id=app.id,
        created_at=app.created_at,
        recipient=app.data["application"]["recipient"],
        network=app.network,
        round=app.round_id,
        answers=json.dumps(app.data["application"]["answers"]),
        project_id=app.project_id
    ))

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
