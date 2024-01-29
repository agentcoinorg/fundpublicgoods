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
    }).execute()

def insert_multiple(run_id: str, strategies: list[WeightedProject]) -> None:
    db = create_admin()
    db.table("strategy_entries").insert(
        [
            {
                "run_id": run_id,
                "reasoning": entry.evaluation.reasoning,
                "weight": entry.weight,
                "impact": entry.evaluation.impact,
                "interest": entry.evaluation.interest,
                "project_id": entry.project.id,
            }
            for entry in strategies
        ]
    ).execute()
