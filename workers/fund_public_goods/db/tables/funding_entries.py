from dataclasses import dataclass
from uuid import UUID
from fund_public_goods.db.client import create_admin


@dataclass(kw_only=True)
class FundingEntryData:
    project_id: str
    amount: float
    token: str
    weight: float

def exists(run_id: str, network: str):
    try:
        db = create_admin()
        entries = db.table("funding_entries").select("id").match({'run_id': run_id, 'network': network}).execute()
        return len(entries.data) > 0
    except:
        return False


def insert_multiple(run_id: str, network: str, entries: list[FundingEntryData]):
    db = create_admin()
    if exists(run_id, network):
        delete_from_run_with_network_name(run_id, network)

    db.table("funding_entries").insert(
        [
            {
                "run_id": run_id,
                "project_id": row.project_id,
                "amount": row.amount,
                "token": row.token,
                "weight": row.weight,
                "network": network
            }
            for row in entries
        ]
    ).execute()

def delete_from_run_with_network_name(run_id: str, network: str):
    db = create_admin()
    db.table("funding_entries").delete().match({ 'run_id': run_id, 'network': network }).execute()

def add_transaction_hash(id: str, hash: str):
    db = create_admin()
    db.table("funding_entries").update({ "transaction_hash": hash }).eq("id", id).execute()
