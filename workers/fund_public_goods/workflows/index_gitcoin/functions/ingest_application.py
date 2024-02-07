import json
from typing import cast
from fund_public_goods.db.entities import Applications, GitcoinApplications, Projects
from fund_public_goods.db.tables import applications, projects
from fund_public_goods.db.tables.projects import get_projects
import uuid
import re


def sanitize_url(url: str) -> str:
    sanitized_url = re.sub(r'^https?:\/\/', '', url, flags=re.IGNORECASE)
    sanitized_url = re.sub(r'\/+$', '', sanitized_url)
    sanitized_url = re.sub(r'^www\.', '', sanitized_url)
    
    return sanitized_url


def process_application(application: GitcoinApplications, network: int):
    existing_projects = get_projects()
    application_project = application.data['application']['project']
    
    matching_project_id = None
    for existing_project in existing_projects:
        if sanitize_url(application_project['website']) == sanitize_url(existing_project.website):
            matching_project_id = existing_project.id
            break
            
    if matching_project_id == None:
        new_project_id = str(uuid.uuid4())
        projects.insert(
            Projects(
                id=new_project_id,
                website=application_project['website']
            )
        )
    else:
        new_project_id = cast(str, matching_project_id)
        
    applications.insert(
        Applications(
            id=application.id,
            createdAt=application.created_at,
            recipient=application.data["application"]["recipient"],
            network=network,
            round=application.round_id,
            answers=json.dumps(application.data["application"]["answers"]),
            projectId=new_project_id,
            title=application_project['title'],
            description=application_project.get("description", ""),
            twitter=application_project.get("projectTwitter", ""),
            logo=application_project.get("logoImg", "")
        )
    )
