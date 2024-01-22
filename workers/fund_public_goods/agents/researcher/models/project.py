from pydantic import BaseModel
from researcher.models.answer import Answer

class Project(BaseModel):
    id: str
    title: str
    recipient: str
    description: str
    website: str
    answers: list[Answer]

    def __getitem__(self, item):
        return getattr(self, item)