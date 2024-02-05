from pydantic import BaseModel
from fund_public_goods.lib.strategy.models.answer import Answer

class Project(BaseModel):
    id: str
    title: str
    description: str
    website: str
    twitter: str
    logo: str
    answers: list[Answer]

    def __getitem__(self, item):
        return getattr(self, item)