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
        "project_id": row.project_id,
        "title": row.title,
        "description": row.description,
        "twitter": row.twitter,
        "logo": row.logo
    }).execute()
