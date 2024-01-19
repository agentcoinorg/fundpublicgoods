from typing import List
from pydantic import BaseModel, ConfigDict, Field

class GitcoinIndexingJob(BaseModel):
    id: str
    url: str
    is_running: bool = Field(..., alias="isRunning")
    skip_rounds: int = Field(..., alias="skipRounds")
    skip_projects: int = Field(..., alias="skipProjects")

    model_config = ConfigDict(
        populate_by_name=True,
    )

class RoundInfo(BaseModel):
    id: str

class ApplicationInfo(BaseModel):
    id: str
    protocol: int
    pointer: str
    round_id: str = Field(..., alias="roundId")
   
    model_config = ConfigDict(
        populate_by_name=True,
    )

class ProjectApplicationInfo(BaseModel):
    id: str
    protocol: int
    pointer: str
    round_id: str = Field(..., alias="roundId")
    project_id: str = Field(..., alias="projectId")
    data: dict

    model_config = ConfigDict(
        populate_by_name=True,
    )

class ProjectInfo(BaseModel):
    id: str
    protocol: int
    pointer: str
    data: dict
