from fund_public_goods.db.tables import applications
from fund_public_goods.lib.strategy.models.answer import Answer


def get_project_answers(project_id: str) -> list[Answer]:
    apps = applications.get_applications(
        project_id
    )
    answers: list[Answer] = []

    for application in apps:
        for answer in application.answers:
            answers.append(Answer(
                question=answer.get("question", ""),
                answer=answer.get("answer", None)
            ))

    return answers
