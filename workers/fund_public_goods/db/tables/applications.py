from supabase import Client, PostgrestAPIResponse
from fund_public_goods.db.entities import Applications

def insert(
    db: Client,
    row: Applications
):
    db.table("applications").insert(
        {
            "id": id,
            "created_at": row.created_at,
            "recipient": row.recipient,
            "network": row.network,
            "round": row.round,
            "answers": row.answers,
            "project_id": row.project_id
        }
    ).execute()
