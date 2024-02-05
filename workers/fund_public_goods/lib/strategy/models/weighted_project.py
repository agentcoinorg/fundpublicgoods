from pydantic import BaseModel
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores

class WeightedProject(BaseModel):
    project: Project
    report: str
    scores: ProjectScores
    weight: float
    smart_ranking: float

    def __getitem__(self, item):
        return getattr(self, item)