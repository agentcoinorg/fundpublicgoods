from pydantic import BaseModel, ConfigDict, Field

class ProjectEvaluation(BaseModel):
    project_id: str = Field(..., alias="projectId")
    reasoning: str
    impact: float
    interest: float

    def __getitem__(self, item):
        return getattr(self, item)
    
    model_config = ConfigDict(
        populate_by_name=True,
    )