import json
from urllib.parse import urlparse
from fund_public_goods.db.entities import Applications, GitcoinApplications, Projects
from fund_public_goods.db.tables import applications, projects
from fund_public_goods.db.tables.projects import get_projects, merge_projects
import uuid
import re


def sanitize_url(url: str) -> str:
    sanitized_url = re.sub(r'^https?:\/\/', '', url, flags=re.IGNORECASE)
    sanitized_url = re.sub(r'\/+$', '', sanitized_url)
    sanitized_url = re.sub(r'^www\.', '', sanitized_url)
    
    return sanitized_url


def process_application(application: GitcoinApplications, network: int):
    existing_projects = get_projects().data
    application_project = application.data['application']['project']
    
    matches = []
    for existing_project in existing_projects:
        project_websites = [urlparse(app['website']).netloc for app in existing_project['applications']]
        
        if urlparse(application_project['website']).netloc in project_websites:
            matches.append(existing_project)
            
    if len(matches) == 0:
        new_project_id = str(uuid.uuid4())
        projects.insert(
            Projects(
                id=new_project_id
            )
        )
    elif len(matches) == 1:
        new_project_id = matches[0]['id']
    else:
        new_project_id = merge_projects([project['id'] for project in matches]).data[0]
        
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
            website=application_project['website'],
            twitter=application_project.get("projectTwitter", ""),
            logo=application_project.get("logoImg", "")
        )
    )
