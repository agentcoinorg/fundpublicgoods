from fund_public_goods.db.entities import Projects
from pydantic import BaseModel, ConfigDict, Field
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores

class WeightedProject(BaseModel):
    project: Projects
    report: str
    scores: ProjectScores
    smart_ranking: float = Field(..., alias="smartRanking")

    def __getitem__(self, item):
        return getattr(self, item)
    
    model_config = ConfigDict(
        populate_by_name=True,
    )