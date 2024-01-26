from pydantic import BaseModel, ConfigDict, Field

class RoundInfo(BaseModel):
    id: str

class ApplicationInfo(BaseModel):
    id: str
    created_at: int = Field(..., alias="createdAt")
    protocol: int
    pointer: str
    round_id: str = Field(..., alias="roundId")
   
    model_config = ConfigDict(
        populate_by_name=True,
    )
