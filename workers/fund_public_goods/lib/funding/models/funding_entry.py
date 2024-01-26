from fund_public_goods.lib.strategy.models.project import Project
from typing import Optional
from pydantic import BaseModel

class FundingEntry(BaseModel):
    project: Project
    amount: str
    token: str
    transaction_id: Optional[str]
    recipient: str
    network: int

    def __getitem__(self, item):
        return getattr(self, item)