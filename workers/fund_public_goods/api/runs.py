from fund_public_goods.inngest_client import inngest_client
from fund_public_goods.workflows.create_strategy.events import CreateStrategyEvent
from fund_public_goods.db import tables, entities, client
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from supabase.lib.client_options import ClientOptions

router = APIRouter()


class Params(BaseModel):
    prompt: str


class Response(BaseModel):
    run_id: str


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
    tables.logs.insert_multiple(run_id)
    await inngest_client.send(
        CreateStrategyEvent.Data(run_id=run_id).to_event()
    )

    return Response(run_id=run_id)
