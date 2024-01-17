from pydantic import BaseModel

class Answer(BaseModel):
    question: str
    answer: str

    def __getitem__(self, item):
        return getattr(self, item)