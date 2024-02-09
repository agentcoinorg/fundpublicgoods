from fund_public_goods.db import tables
from fund_public_goods.lib.strategy.models.answer import Answer


def get_project_answers(project_id: str) -> list[Answer]:
    applications = tables.applications.get_applications(
        project_id
    )
    answers: list[Answer] = []

    for application in applications:
        if application.answers:
            answers.append(Answer(
                question=application.answers["question"],
                answer=application.answers["answer"]
            ))

    return answers
