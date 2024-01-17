from fastapi import APIRouter

router = APIRouter()

@router.get("/api/version")
async def get_version():
    return {"version": "0.1.0"}
