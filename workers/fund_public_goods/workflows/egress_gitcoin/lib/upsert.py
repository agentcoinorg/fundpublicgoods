import json
from fund_public_goods.db.entities import GitcoinProjects, GitcoinApplications
from fund_public_goods.db import tables, entities, vectors

def upsert_project(project: GitcoinProjects, updated_at: int):
    entity = entities.Projects(
        id=project.id,
        updated_at=updated_at,
        title=project.data["title"],
        description=project.data["description"],
        website=project.data["website"],
        twitter=project.data.get("projectTwitter", ""),
        logo=project.data.get("logoImg", ""),
    )

    tables.projects.upsert(entity)

    vectors.projects.upsert(
        id=entity.id,
        title=entity.title,
        description=entity.description,
        website=entity.website
    )
    # TODO: upsert [project.id]: { title, description, website }

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

    # TODO: upsert [app.id]: { [...answers, new] }
