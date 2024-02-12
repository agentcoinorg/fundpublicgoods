from typing import Optional
from pydantic import BaseModel, Field
from fund_public_goods.lib.strategy.models.answer import Answer

class Project(BaseModel):
    id: str
    title: str
    description: str
    short_description: Optional[str] = Field(..., alias="shortDescription")
    impact: Optional[float] = None
    funding_needed: Optional[float] = Field(..., alias="fundingNeeded")
    website: str
    twitter: str
    logo: str
    answers: list[Answer]

    def __getitem__(self, item):
        return getattr(self, item)