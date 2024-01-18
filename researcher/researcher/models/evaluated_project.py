from pydantic import BaseModel
from researcher.models.project import Project
from researcher.models.project_evaluation import ProjectEvaluation

class EvaluatedProject(BaseModel):
    project: Project
    evaluation: ProjectEvaluation

    def __getitem__(self, item):
        return getattr(self, item)