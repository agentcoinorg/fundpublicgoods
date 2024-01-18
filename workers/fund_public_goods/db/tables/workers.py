from supabase import Client


def insert(db: Client, id: str, prompt: str):
    db.table("workers").insert({"id": id, "prompt": prompt}).execute()
