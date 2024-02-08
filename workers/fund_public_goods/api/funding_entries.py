from fund_public_goods.db.tables.funding_entries import FundingEntryData, insert_multiple
from fund_public_goods.db import tables
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter()

class StrategiesInformation(BaseModel):
    project_id: str
    weight: float
    amount: float


class Body(BaseModel):
    strategies: list[StrategiesInformation]
    token: str
    decimals: int
    network: str


class Response(BaseModel):
    status: int


@router.post("/api/runs/{run_id}/funding-entries")
async def funding_entries(run_id: str, body: Body) -> Response:
    run_exists = tables.runs.exists(run_id)
    if not run_exists:
        raise HTTPException(
            status_code=400, detail=f"Run with ID: {run_id} is not valid"
        )

    funding_entries = []
    for strategy in body.strategies:
        entry = FundingEntryData(
            project_id=strategy.project_id,
            amount=strategy.amount,
            token=body.token,
            weight=strategy.weight,
        )
        funding_entries.append(entry)

    insert_multiple(run_id=run_id, network=body.network, entries=funding_entries)
    return Response(status=200)
