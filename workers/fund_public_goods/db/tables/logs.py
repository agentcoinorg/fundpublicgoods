from supabase import Client
from fund_public_goods.db.entities import Logs

def insert(
    db: Client,
    row: Logs
):
    db.table("logs").insert({
        "run_id": row.run_id,
        "message": row.message
    }).execute()
