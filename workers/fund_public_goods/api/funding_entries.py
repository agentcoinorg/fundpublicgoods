from fund_public_goods.db.tables.funding_entries import FundingEntries, insert_multiple
from fund_public_goods.lib.funding.utils.distribute_weight import distribute_weights
from fund_public_goods.db import client, tables
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class StrategiesInformation(BaseModel):
    project_id: str
    weight: float


class Body(BaseModel):
    strategies: list[StrategiesInformation]
    amount: float
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

    amounts = distribute_weights(
        [strategy.weight for strategy in body.strategies], body.amount, body.decimals
    )
    funding_entries = []
    for index, strategy in enumerate(body.strategies):
        entry = FundingEntries(
            project_id=strategy.project_id,
            amount=amounts[index],
            token=body.token,
            weight=strategy.weight,
        )
        funding_entries.append(entry)

    insert_multiple(supabase, run_id, funding_entries)
    return Response(status=200)
