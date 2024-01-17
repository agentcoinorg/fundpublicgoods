from pydantic import BaseModel

class ProjectEvaluation(BaseModel):
    project_id: str
    score: float

    def __getitem__(self, item):
        return getattr(self, item)