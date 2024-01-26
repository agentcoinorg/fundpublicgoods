from supabase import Client, PostgrestAPIResponse
from fund_public_goods.db.entities import Applications

def insert(
    db: Client,
    row: Applications
):
    db.table("applications").insert({
        "id": row.id,
        "created_at": row.created_at,
        "recipient": row.recipient,
        "network": row.network,
        "round": row.round,
        "answers": row.answers,
        "project_id": row.project_id
    }).execute()

def get_applications(
    db: Client,
    project_id: str
) -> list[Applications]:
    result = (db.table("applications")
        .select("id, created_at, recipient, network, round, answers, project_id")
        .eq("project_id", project_id)
        .execute())

    if not result.data:
        return []

    applications = []

    for item in result.data:
        applications.append(Applications(
            id=item["id"],
            created_at=item["created_at"],
            recipient=item["recipient"],
            network=item["network"],
            round=item["round"],
            answers=item["answers"],
            project_id=item["project_id"]
        ))

    return applications
