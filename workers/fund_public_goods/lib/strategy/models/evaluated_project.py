from fund_public_goods.db.entities import Projects
from pydantic import BaseModel
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores

class EvaluatedProject(BaseModel):
    project: Projects
    evaluation: ProjectScores

    def __getitem__(self, item):
        return getattr(self, item)