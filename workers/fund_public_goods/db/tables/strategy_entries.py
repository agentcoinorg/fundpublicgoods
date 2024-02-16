from fund_public_goods.lib.strategy.models.smart_ranked_project import SmartRankedProject
from fund_public_goods.db.entities import StrategyEntries
from fund_public_goods.db.app_db import create_admin


def insert(
    row: StrategyEntries
):
    db = create_admin()
    db.table("strategy_entries").insert({
        "run_id": str(row.run_id),
        "project_id": row.project_id,
        "impact": row.impact,
        "interest": row.interest,
        "smart_ranking": row.smart_ranking,
    }).execute()

def insert_multiple(run_id: str, strategies: list[tuple[SmartRankedProject, str]]) -> None:
    db = create_admin()
    db.table("strategy_entries").insert(
        [
            {
                "run_id": run_id,
                "impact": entry.scores.impact,
                "interest": entry.scores.prompt_match,
                "funding_needed": entry.scores.funding_needed,
                "report": report,
                "project_id": entry.project.id,
                "smart_ranking": entry.smart_ranking,
            }
            for (entry, report) in strategies
        ]
    ).execute()
