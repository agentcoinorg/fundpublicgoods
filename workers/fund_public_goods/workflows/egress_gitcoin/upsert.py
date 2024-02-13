import json
import re
from fund_public_goods.db.entities import GitcoinProjects, GitcoinApplications
from fund_public_goods.db import tables, entities

def sanitize_url(url: str) -> str:
    sanitized_url = re.sub(r'^https?:\/\/', '', url, flags=re.IGNORECASE)
    sanitized_url = re.sub(r'\/+$', '', sanitized_url)
    sanitized_url = re.sub(r'^www\.', '', sanitized_url)

    return sanitized_url

def upsert_project(project: GitcoinProjects, updated_at: int):
    entity = entities.Projects(
        id=project.id,
        updated_at=updated_at,
        title=project.data["title"],
        description=project.data["description"],
        website=sanitize_url(project.data["website"]),
        twitter=project.data.get("projectTwitter", ""),
        logo=project.data.get("logoImg", ""),
        short_description=None
    )

    tables.projects.upsert(entity)

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

    # TODO:
    # user_query -> [indexed-questions]
    # top_questions ->
    # for each question
        # user_query + question_filter -> [indexed-answers + question-filter]
