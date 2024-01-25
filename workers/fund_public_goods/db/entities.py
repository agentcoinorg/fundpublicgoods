from uuid import UUID
import datetime
from typing import Optional
from pydantic import BaseModel, Json, Field, ConfigDict


class Applications(BaseModel):

    id: str
    created_at: int = Field(..., alias="createdAt")
    recipient: str
    network: int
    round: str
    answers: Optional[Json] = None
    project_id: str = Field(..., alias="projectId")
    model_config = ConfigDict(
        populate_by_name=True
    )


class GitcoinApplications(BaseModel):

    id: str
    created_at: int = Field(..., alias="createdAt")
    data: Json
    protocol: int
    pointer: str
    round_id: str = Field(..., alias="roundId")
    project_id: str = Field(..., alias="projectId")
    model_config = ConfigDict(
        populate_by_name=True
    )


class GitcoinIndexingJobs(BaseModel):

    id: Optional[UUID] = None
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    url: str
    network_id: int = Field(..., alias="networkId")
    is_running: bool = False
    skip_rounds: int = 0
    skip_projects: int = 0
    last_updated_at: Optional[datetime.datetime] = Field(default=None, alias="lastUpdatedAt")
    is_failed: bool = False
    error: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True
    )


class GitcoinProjects(BaseModel):

    id: str
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    data: Json
    protocol: int
    pointer: str

    model_config = ConfigDict(
        populate_by_name=True
    )


class Logs(BaseModel):

    id: Optional[UUID] = None
    run_id: UUID = Field(..., alias="runId")
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    message: str

    model_config = ConfigDict(
        populate_by_name=True
    )


class Projects(BaseModel):

    id: str
    title: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True
    )


class Runs(BaseModel):

    id: Optional[UUID] = None
    worker_id: UUID = Field(..., alias="workerId")
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    prompt: str

    model_config = ConfigDict(
        populate_by_name=True
    )


class StrategyEntries(BaseModel):

    id: Optional[UUID] = None
    run_id: UUID = Field(..., alias="runId")
    project_id: str = Field(..., alias="projectId")
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    reasoning: Optional[str] = None
    impact: Optional[float] = None
    interest: Optional[float] = None
    weight: Optional[float] = None

    model_config = ConfigDict(
        populate_by_name=True
    )


class Workers(BaseModel):

    id: Optional[UUID] = None
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")


    model_config = ConfigDict(
        populate_by_name=True
    )