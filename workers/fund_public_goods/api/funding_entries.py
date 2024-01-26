from fund_public_goods.db.tables.funding_entries import FundingEntries, insert_multiple
from fund_public_goods.db import client, tables
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


class Response(BaseModel):
    status: int


@router.post("/api/runs/{run_id}/funding-entries")
async def funding_entries(run_id: str, body: Body) -> Response:
    supabase = client.create_admin()
    run_exists = tables.runs.exists(supabase, run_id)
    if not run_exists:
        raise HTTPException(
            status_code=400, detail=f"Run with ID: {run_id} is not valid"
        )

    funding_entries = []
    for strategy in body.strategies:
        entry = FundingEntries(
            project_id=strategy.project_id,
            amount=strategy.amount,
            token=body.token,
            weight=strategy.weight,
        )
        funding_entries.append(entry)

    insert_multiple(supabase, run_id, funding_entries)
    return Response(status=200)
