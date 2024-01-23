from fund_public_goods.inngest_client import inngest_client
from fund_public_goods.events import CreateStrategyEvent
from fund_public_goods.db import client, tables
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class Params(BaseModel):
    prompt: str


class Response(BaseModel):
    worker_id: str
    run_id: str


@router.post("/api/workers")
async def workers(params: Params) -> Response:
    prompt = params.prompt if params.prompt else ""

    if prompt == "":
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    supabase = client.create_admin()
    worker_id = tables.workers.insert(supabase)
    run_id = tables.runs.insert(supabase, worker_id, prompt)

    await inngest_client.send(
        CreateStrategyEvent.Data(
            run_id=run_id
        ).to_event()
    )

    return Response(worker_id=worker_id, run_id=run_id)
