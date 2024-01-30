from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from supabase.lib.client_options import ClientOptions
from fund_public_goods.inngest_client import inngest_client
from fund_public_goods.workflows.create_strategy.events import CreateStrategyEvent
from fund_public_goods.db import client, tables, entities

router = APIRouter()


class Params(BaseModel):
    prompt: str


class Response(BaseModel):
    worker_id: str
    run_id: str


@router.post("/api/workers")
async def workers(params: Params, authorization: Optional[str] = Header(None)) -> Response:
    if authorization:
        supabase_auth_token = authorization.split(" ")[1]
    else:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    prompt = params.prompt if params.prompt else ""

    if prompt == "":
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    db = client.create(options=ClientOptions())
    db.postgrest.auth(supabase_auth_token)
    
    worker_id = tables.workers.insert(db)
    
    run_id = tables.runs.insert(entities.Runs(
        worker_id=worker_id,
        prompt=prompt
    ), db)

    await inngest_client.send(
        CreateStrategyEvent.Data(
            run_id=run_id
        ).to_event()
    )

    return Response(worker_id=worker_id, run_id=run_id)
