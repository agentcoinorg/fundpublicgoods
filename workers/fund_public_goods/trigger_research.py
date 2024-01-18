from fastapi import APIRouter

router = APIRouter()


class TriggerResearch:
    prompt: str

@router.post("/api/trigger-research")
async def create_plan(params: TriggerResearch):
    pass
