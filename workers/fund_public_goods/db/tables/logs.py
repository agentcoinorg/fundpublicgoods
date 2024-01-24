from typing import Literal
from supabase import Client

def insert(
    db: Client,
    run_id: str,
    step: Literal["FETCH_PROJECTS", "EVALUATE_PROJECTS", "ANALYZE_FUNDING", "SYNTHESIZE_RESULTS"],
    message: str
):
    db.table("logs").insert({
        "run_id": run_id,
        "step": step,
        "message": message
    }).execute()
