from fund_public_goods.inngest_client import inngest_client
from fund_public_goods.workflows.create_strategy.events import CreateStrategyEvent
from fund_public_goods.db import client, tables, entities
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class Params(BaseModel):
    prompt: str


class Response(BaseModel):
    run_id: str


@router.post("/api/workers/{worker_id}/runs")
async def runs(worker_id: str, params: Params) -> Response:
    prompt = params.prompt if params.prompt else ""

    if prompt == "":
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    db = client.create_admin()
    worker_exists = tables.workers.exists(db, worker_id)
    if not worker_exists:
        raise HTTPException(
            status_code=400, detail=f"Worker with ID: {worker_id} is not valid"
        )

    run_id = tables.runs.insert(db, entities.Runs(
        worker_id=worker_id,
        prompt=prompt
    ))
    await inngest_client.send(
        CreateStrategyEvent.Data(prompt=prompt, run_id=run_id).to_event()
    )

    return Response(run_id=run_id)
