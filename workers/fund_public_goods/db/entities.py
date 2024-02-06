from enum import Enum
from uuid import UUID
import datetime
from typing import Optional
from pydantic import BaseModel, Json, Field, ConfigDict


class StepName(str, Enum):

    ANALYZE_FUNDING = 'ANALYZE_FUNDING'
    EVALUATE_PROJECTS = 'EVALUATE_PROJECTS'
    FETCH_PROJECTS = 'FETCH_PROJECTS'
    SYNTHESIZE_RESULTS = 'SYNTHESIZE_RESULTS'
    

class StepStatus(str, Enum):

    COMPLETED = 'COMPLETED'
    ERRORED = 'ERRORED'
    IN_PROGRESS = 'IN_PROGRESS'
    NOT_STARTED = 'NOT_STARTED'
    

class GitcoinApplications(BaseModel):

    id: str
    created_at: int = Field(..., alias="createdAt")
    data: Json
    protocol: int
    pointer: str
    round_id: str = Field(..., alias="roundId")
    project_id: str = Field(..., alias="projectId")
    network: int

    model_config = ConfigDict(
        populate_by_name=True
    )


class GitcoinEgressJobs(BaseModel):

    id: Optional[UUID] = None
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    is_running: bool = False
    skip_applications: int = 0
    last_updated_at: Optional[datetime.datetime] = Field(default=None, alias="lastUpdatedAt")
    is_failed: bool = False
    error: Optional[str] = None

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


class FundingEntries(BaseModel):

    id: Optional[UUID] = None
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    run_id: UUID = Field(..., alias="runId")
    project_id: str = Field(..., alias="projectId")
    transaction_id: Optional[str] = Field(default=None, alias="transactionId")
    amount: str
    token: str
    weight: float

    model_config = ConfigDict(
        populate_by_name=True
    )


class Projects(BaseModel):

    id: str
    updated_at: int = Field(..., alias="updatedAt")
    title: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    twitter: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True
    )


class Logs(BaseModel):

    id: Optional[UUID] = None
    run_id: UUID = Field(..., alias="runId")
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    ended_at: Optional[datetime.datetime] = Field(default=None, alias="endedAt")
    status: StepStatus
    step_name: StepName = Field(..., alias="stepName")
    value: Optional[str] = None

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
    smart_ranking: Optional[float] = Field(default=None, alias="smartRanking")

    model_config = ConfigDict(
        populate_by_name=True
    )


class Users(BaseModel):

    id: Optional[UUID] = None
    created_at: Optional[datetime.datetime] = Field(default=None, alias="createdAt")
    address: Optional[str] = None
    is_anon: bool = Field(..., alias="isAnon")
    model_config = ConfigDict(
        populate_by_name=True
    )