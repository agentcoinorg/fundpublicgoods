from pydantic import BaseModel
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.models.project_evaluation import ProjectEvaluation

class EvaluatedProject(BaseModel):
    project: Project
    evaluation: ProjectEvaluation

    def __getitem__(self, item):
        return getattr(self, item)