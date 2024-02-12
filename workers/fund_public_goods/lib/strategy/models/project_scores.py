from pydantic import BaseModel, ConfigDict, Field

class ProjectScores(BaseModel):
    project_id: str = Field(..., alias="projectId")
    prompt_match: float = Field(..., alias="promptMatch")
    impact: float
    funding_needed: float = Field(..., alias="fundingNeeded")

    def __getitem__(self, item):
        return getattr(self, item)
    
    model_config = ConfigDict(
        populate_by_name=True,
    )