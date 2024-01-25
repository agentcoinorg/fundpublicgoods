from pydantic import BaseModel
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.models.project_evaluation import ProjectEvaluation

class WeightedProject(BaseModel):
    project: Project
    evaluation: ProjectEvaluation
    weight: float

    def __getitem__(self, item):
        return getattr(self, item)