from dataclasses import dataclass
from fund_public_goods.db.client import create_admin


@dataclass(kw_only=True)
class FundingEntries:
    project_id: str
    amount: float
    token: str
    weight: float

def exists(run_id: str):
    try:
        db = create_admin()
        entries = db.table("funding_entries").select("id").eq("run_id", run_id).execute()
        return len(entries.data) > 0
    except:
        return False


def insert_multiple(run_id: str, entries: list[FundingEntries]):
    db = create_admin()
    if exists(run_id):
        delete_from_run(run_id)

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

def delete_from_run(run_id):
    db = create_admin()
    db.table("funding_entries").delete().eq("run_id", run_id).execute()

def add_transaction_hash(id: str, hash: str):
    db = create_admin()
    db.table("funding_entries").update({ "transaction_hash": hash }).eq("id", id).execute()
