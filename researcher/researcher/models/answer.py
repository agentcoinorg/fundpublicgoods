from pydantic import BaseModel

class Answer(BaseModel):
    question: str
    answer: str | None = None

    def __getitem__(self, item):
        return getattr(self, item)