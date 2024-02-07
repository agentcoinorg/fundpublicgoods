from fund_public_goods.lib.strategy.utils.initialize_logs import initialize_logs
from fund_public_goods.db import tables, entities, client
from supabase.lib.client_options import ClientOptions
from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import os
import asyncio
import httpx


api_url = os.getenv("WORKERS_URL")
router = APIRouter()

class Params(BaseModel):
    prompt: str

class Response(BaseModel):
    run_id: str

async def run(run_id: str, authorization: str):
    client = httpx.AsyncClient()

    async def task():
        try:
            await client.post(
                f"{api_url}/api/runs/run",
                json={"run_id": run_id},
                headers={"Authorization": authorization}
            )
        finally:
            await client.aclose()

    asyncio.create_task(task())

@router.post("/api/runs")
async def runs(params: Params, authorization: Optional[str] = Header(None)) -> Response:
    if authorization:
        supabase_auth_token = authorization.split(" ")[1]
    else:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    prompt = params.prompt if params.prompt else ""

    if prompt == "":
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    db = client.create(options=ClientOptions())
    db.postgrest.auth(supabase_auth_token)
    
    run_id = tables.runs.insert(entities.Runs(
        prompt=prompt
    ), db)
    initialize_logs(run_id)

    await run(run_id, authorization)

    return Response(run_id=run_id)
