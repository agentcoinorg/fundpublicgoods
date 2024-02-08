from fund_public_goods.db.client import create_admin
from fund_public_goods.db.entities import Applications


def insert(
    row: Applications
):
    db = create_admin()
    db.table("applications").insert({
        "id": row.id,
        "created_at": row.created_at,
        "recipient": row.recipient,
        "network": row.network,
        "round": row.round,
        "answers": row.answers,
        "project_id": row.project_id
    }).execute()

def upsert(
    row: Applications
):
    db = create_admin()
    db.table("applications").upsert({
        "id": row.id,
        "created_at": row.created_at,
        "recipient": row.recipient,
        "network": row.network,
        "round": row.round,
        "answers": row.answers,
        "project_id": row.project_id
    }).execute()

def get_applications(
    project_id: str
) -> list[Applications]:
    db = create_admin()
    result = (db.table("applications")
        .select("id, created_at, recipient, gitcoin_project_id, network, round, answers, project_id")
        .eq("project_id", project_id)
        .execute())

    if not result.data:
        return []

    applications = []

    for item in result.data:
        applications.append(Applications(
            id=item["id"],
            createdAt=item["created_at"],
            recipient=item["recipient"],
            network=item["network"],
            round=item["round"],
            answers=item["answers"],
            projectId=item["project_id"],
            gitcoinProjectId=item["gitcoin_project_id"],
        ))

    return applications
