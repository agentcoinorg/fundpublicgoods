from supabase import Client

def insert(
    db: Client,
    run_id: str,
    message: str
):
    db.table("logs").insert({
        "run_id": run_id,
        "message": message
    }).execute()
