from dataclasses import dataclass
from supabase import Client


@dataclass(kw_only=True)
class FundingEntries:
    project_id: str
    amount: float
    token: str
    weight: float

def exists(db: Client, run_id: str):
    try:
        entries = db.table("funding_entries").select("id").eq("run_id", run_id).execute()
        return len(entries.data) > 0
    except:
        return False


def insert_multiple(db: Client, run_id: str, entries: list[FundingEntries]):
    if exists(db, run_id):
        delete_from_run(db, run_id)

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

def delete_from_run(db: Client, run_id):
    db.table("funding_entries").delete().eq("run_id", run_id).execute()

def add_transaction_hash(db: Client, id: str, hash: str):
    db.table("funding_entries").update({ "transaction_hash": hash }).eq("id", id).execute()
