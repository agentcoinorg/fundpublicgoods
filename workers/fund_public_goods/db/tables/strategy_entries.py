from typing import List
from supabase import Client
from fund_public_goods.agents.researcher.models.weighted_project import WeightedProject

from fund_public_goods.db.client import create_admin


def insert(
    run_id: str,
    project_id: str,
    reasoning: str,
    impact: float,
    interest: float,
    weight: float,
):
    db = create_admin()
    db.table("strategy_entries").insert(
        {
            "run_id": run_id,
            "project_id": project_id,
            "reasoning": reasoning,
            "impact": impact,
            "interest": interest,
            "weight": weight,
        }
    ).execute()


def insert_multiple(run_id: str, strategies: List[WeightedProject]) -> None:
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
