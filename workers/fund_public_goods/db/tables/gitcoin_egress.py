import datetime
import uuid
import json
import re
from fund_public_goods.db.entities import GitcoinProjects, GitcoinApplications, GitcoinEgressJobs
from fund_public_goods.db.client import create_admin
from fund_public_goods.db import tables, entities
from fund_public_goods.db.tables.projects import update_project
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
                createdAt = data["created_at"],
                protocol = data["protocol"],
                pointer = data["pointer"],
                roundId = data["round_id"],
                projectId = data["project_id"],
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

def sanitize_url(url: str) -> str:
    sanitized_url = re.sub(r'^https?:\/\/', '', url, flags=re.IGNORECASE)
    sanitized_url = re.sub(r'\/+$', '', sanitized_url)
    sanitized_url = re.sub(r'^www\.', '', sanitized_url)
    
    return sanitized_url


def upsert_project(project: GitcoinProjects, updated_at: int) -> str:
    sanitized_website = sanitize_url(project.data["website"])
    existing_projects = tables.projects.get_project_by_website(sanitized_website).data
    
    if not existing_projects:
        id = str(uuid.uuid4())
        
        row = entities.Projects(
            id=id,
            gitcoinId=project.id,
            updatedAt=updated_at,
            title=project.data["title"],
            description=project.data["description"],
            website=sanitized_website,
            twitter=project.data.get("projectTwitter", ""),
            logo=project.data.get("logoImg", ""),
        )
        tables.projects.upsert(row)
        
        return id
    else:
        if updated_at > existing_projects[0]['updated_at']:
            update_project(
                id=existing_projects[0]['id'],
                updated_at=updated_at,
                title=project.data["title"],
                description=project.data["description"],
                twitter=project.data.get("projectTwitter", ""),
                logo=project.data.get("logoImg", "")
            )
        
        return existing_projects[0]['id']
    

def upsert_application(project_id: str, app: GitcoinApplications):
    tables.applications.upsert(entities.Applications(
        id=app.id,
        createdAt=app.created_at,
        recipient=app.data["application"]["recipient"],
        network=app.network,
        round=app.round_id,
        answers=json.dumps(app.data["application"]["answers"]),
        gitcoinProjectId=app.project_id,
        projectId=project_id
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
