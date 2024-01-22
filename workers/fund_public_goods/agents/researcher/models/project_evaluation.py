from pydantic import BaseModel

class ProjectEvaluation(BaseModel):
    project_id: str
    reasoning: str
    impact: float
    interest: float

    def __getitem__(self, item):
        return getattr(self, item)