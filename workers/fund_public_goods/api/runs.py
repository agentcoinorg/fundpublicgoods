from fund_public_goods.lib.strategy.utils.initialize_logs import initialize_logs
from fund_public_goods.db import tables, entities, app_db
from supabase.lib.client_options import ClientOptions
from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import httpx
import os


api_url = os.getenv("WORKERS_URL")
router = APIRouter()

class Params(BaseModel):
    prompt: str


class Response(BaseModel):
    run_id: str

async def run(run_id: str, authorization: str):
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{api_url}/api/runs/run",
            json={"run_id": run_id},
            headers={"Authorization": authorization}
        )

@router.post("/api/runs")
async def runs(background_tasks: BackgroundTasks, params: Params, authorization: Optional[str] = Header(None)) -> Response:
    if authorization:
        supabase_auth_token = authorization.split(" ")[1]
    else:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    prompt = params.prompt if params.prompt else ""
    if prompt == "":
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    db = app_db.create(options=ClientOptions())
    db.postgrest.auth(supabase_auth_token)
    
    run_id = tables.runs.insert(entities.Runs(
        prompt=prompt
    ), db)
    initialize_logs(run_id)
    background_tasks.add_task(run, run_id, authorization)

    return Response(run_id=run_id)
