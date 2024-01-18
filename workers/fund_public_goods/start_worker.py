from fund_public_goods.inngest_client import inngest_client
from fund_public_goods.events import CreateStrategyEvent
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid

router = APIRouter()

class Params(BaseModel):
    prompt: str

class Response(BaseModel):
    worker_id: str

@router.post("/api/start-worker")
async def start_worker(params: Params) -> Response:
    prompt = params.prompt if params.prompt else ""

    if prompt == "":
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    worker_id = str(uuid.uuid4())

    await inngest_client.send(
        CreateStrategyEvent.Data(
            prompt=prompt,
            worker_id=worker_id
        ).to_event()
    )

    return Response(worker_id=worker_id)
