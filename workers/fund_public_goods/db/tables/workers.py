from supabase import Client
import uuid


def exists(db: Client, worker_id: str) -> bool:
    try:
        worker = db.table('workers').select('id').eq('id', worker_id).execute()
        if (worker.error):
            return False
        return len(worker.data) > 0
    except:
        return False


def insert(db: Client) -> str:
    id = str(uuid.uuid4())
    db.table("workers").insert({"id": id}).execute()
    return id
