from pydantic import BaseModel
from researcher.models.project import Project
from researcher.models.project_evaluation import ProjectEvaluation

class WeightedProject(BaseModel):
    project: Project
    evaluation: ProjectEvaluation
    weight: float

    def __getitem__(self, item):
        return getattr(self, item)