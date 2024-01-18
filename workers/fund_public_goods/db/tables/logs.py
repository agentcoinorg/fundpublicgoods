from fund_public_goods.db import client

def insert(worker_id: str, status: str):
    db = client.create_admin()
    db.table("logs").insert({"worker_id": worker_id, "status": status}).execute()
