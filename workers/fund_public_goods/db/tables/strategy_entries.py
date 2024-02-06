from fund_public_goods.lib.strategy.models.weighted_project import WeightedProject
from fund_public_goods.db.entities import StrategyEntries
from fund_public_goods.db.client import create_admin


def insert(
    row: StrategyEntries
):
    db = create_admin()
    db.table("strategy_entries").insert({
        "run_id": str(row.run_id),
        "project_id": row.project_id,
        "reasoning": row.reasoning,
        "impact": row.impact,
        "interest": row.interest,
        "weight": row.weight,
        "smart_ranking": row.smart_ranking,
    }).execute()

def insert_multiple(run_id: str, strategies: list[WeightedProject]) -> None:
    db = create_admin()
    db.table("strategy_entries").insert(
        [
            {
                "run_id": run_id,
                "reasoning": entry.scores.reasoning,
                "weight": entry.weight,
                "impact": entry.scores.impact,
                "interest": entry.scores.prompt_match,
                "funding_needed": entry.scores.funding_needed,
                "report": entry.report,
                "project_id": entry.project.id,
                "smart_ranking": entry.smart_ranking,
            }
            for entry in strategies
        ]
    ).execute()
