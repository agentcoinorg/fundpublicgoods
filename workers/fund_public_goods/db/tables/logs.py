from fund_public_goods.db import client

def insert(run_id: str, message: str):
    db = client.create_admin()
    db.table("logs").insert({"run_id": run_id, "message": message}).execute()
