import json
from typing import Any, Dict
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.models.project import Project
from supabase import PostgrestAPIResponse
from fund_public_goods.db.entities import Applications, Projects
from fund_public_goods.db.client import create_admin


def insert(
    row: Projects
):
    db = create_admin()
    db.table("projects").insert({
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
        "twitter": row.twitter,
        "logo": row.logo
    }).execute()

def upsert(
    row: Projects
):
    db = create_admin()
    db.table("projects").upsert({
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
        "twitter": row.twitter,
        "logo": row.logo,
        "gitcoin_id": row.gitcoin_id
    }).execute()

def get(
    project_id: str
) -> Projects | None:
    db = create_admin()
    result = (db.table("projects")
        .select("id", "updated_at", "gitcoin_id", "title", "description", "website", "twitter", "logo")
        .eq("id", project_id)
        .execute())

    if not result.data:
        return None

    data = result.data[0]

    return Projects(
        id=data["id"],
        updatedAt=data["updated_at"],
        title=data["title"],
        description=data["description"],
        website=data["website"],
        twitter=data["twitter"],
        logo=data["logo"],
        gitcoinId=data["gitcoin_id"]
    )
    
def get_project_by_website(sanitized_website: str) -> PostgrestAPIResponse[Dict[str, Any]]:
    db = create_admin()
    return (
        db.table("projects")
        .select(
            "id, website, updated_at"
        )
        .eq('website', sanitized_website)
        .execute()
    )
    
def update_project(id: str, updated_at: int, title: str, description: str, logo: str, twitter: str) -> PostgrestAPIResponse[Dict[str, Any]]:
    db = create_admin()
    return (
        db.table("projects")
        .update({
            "updated_at": updated_at,
            "title": title,
            "description": description,
            "logo": logo,
            "twitter": twitter
        })
        .eq('id', id)
        .execute()
    )

def get_projects() -> PostgrestAPIResponse[Dict[str, Any]]:
    db = create_admin()
    return (
        db.table("projects")
        .select(
            "*, applications(*)"
        )
        .execute()
    )

def fetch_projects_data() -> list[Project]:
    response = get_projects()
    
    projects: list[Project] = []

    for item in response.data:
        applications: list[Applications] = [Applications(**application) for application in item.get("applications", [])]
        
        # Remove all None values
        project_data = {k: v for k, v in item.items() if v is not None}

        project = Project(
            id=project_data.get("id", ""),
            title=project_data.get("title", ""),
            description=project_data.get("description", ""),
            website=project_data.get("website", ""),
            twitter=project_data.get("twitter", ""),
            logo=project_data.get("logo", ""),
            applications=applications,
        )
        
        projects.append(project)

    return projects
