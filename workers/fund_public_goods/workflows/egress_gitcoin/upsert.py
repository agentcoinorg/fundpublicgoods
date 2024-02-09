import json
from fund_public_goods.db.entities import GitcoinProjects, GitcoinApplications
from fund_public_goods.db import tables, entities, indexes

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

    if entity.description:
        indexes.projects.upsert(
            id=entity.id,
            description=entity.description,
        )

def upsert_application(app: GitcoinApplications):
    tables.applications.upsert(entities.Applications(
        id=app.id,
        created_at=app.created_at,
        recipient=app.data["application"]["recipient"],
        network=app.network,
        round=app.round_id,
        answers=app.data["application"]["answers"],
        project_id=app.project_id
    ))

    # TODO:
    # user_query -> [indexed-questions]
    # top_questions ->
    # for each question
        # user_query + question_filter -> [indexed-answers + question-filter]
