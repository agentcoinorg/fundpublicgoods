from uuid import UUID
import datetime
from typing import Optional
from pydantic import BaseModel, Json


class Applications(BaseModel):

    id: str
    created_at: int
    recipient: str
    network: int
    round: str
    answers: Optional[Json]
    project_id: str


class GitcoinApplications(BaseModel):

    id: str
    created_at: int
    data: Json
    protocol: int
    pointer: str
    round_id: str
    project_id: str


class GitcoinIndexingJobs(BaseModel):

    id: Optional[UUID]
    created_at: Optional[datetime.datetime]
    url: str
    network_id: int
    is_running: bool = false
    skip_rounds: int = 0
    skip_projects: int = 0
    last_updated_at: Optional[datetime.datetime]
    is_failed: bool = false
    error: Optional[str]


class GitcoinProjects(BaseModel):

    id: str
    created_at: Optional[datetime.datetime]
    data: Json
    protocol: int
    pointer: str


class Logs(BaseModel):

    id: Optional[UUID]
    run_id: UUID
    created_at: Optional[datetime.datetime]
    message: str


class Projects(BaseModel):

    id: str
    title: Optional[str]
    description: Optional[str]
    website: Optional[str]


class Runs(BaseModel):

    id: Optional[UUID]
    worker_id: UUID
    created_at: Optional[datetime.datetime]
    prompt: str


class StrategyEntries(BaseModel):

    id: Optional[UUID]
    run_id: UUID
    project_id: str
    created_at: Optional[datetime.datetime]
    reasoning: Optional[str]
    impact: Optional[float]
    interest: Optional[float]
    weight: Optional[float]


class Workers(BaseModel):

    id: Optional[UUID]
    created_at: Optional[datetime.datetime]
