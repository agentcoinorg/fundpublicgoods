from dataclasses import dataclass
from supabase import Client


@dataclass(kw_only=True)
class FundingEntries:
    project_id: str
    amount: int
    token: str
    weight: float


def insert_multiple(db: Client, run_id: str, entries: list[FundingEntries]):
    db.table("funding_entries").insert(
        [
            {
                "run_id": run_id,
                "amount": str(entry.amount),
                "token": entry.token,
                "project_id": entry.project_id,
                "weight": entry.weight
            }
            for entry in entries
        ]
    ).execute()


def add_transaction_hash(db: Client, id: str, hash: str):
    db.table("funding_entries").update({ "transaction_hash": hash }).eq("id", id).execute()
