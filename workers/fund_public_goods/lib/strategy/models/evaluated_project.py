from pydantic import BaseModel
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores

class EvaluatedProject(BaseModel):
    project: Project
    evaluation: ProjectScores

    def __getitem__(self, item):
        return getattr(self, item)