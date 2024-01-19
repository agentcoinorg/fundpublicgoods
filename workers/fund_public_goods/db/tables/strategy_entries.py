from supabase import Client


def insert(
    db: Client,
    run_id: str,
    project_id: str,
    reasoning: str,
    impact: float,
    interest: float,
    weight: float
):
    db.table("strategy_entries").insert({
        "run_id": run_id,
        "project_id": project_id,
        "reasoning": reasoning,
        "impact": impact,
        "interest": interest,
        "weight": weight,
    }).execute()
