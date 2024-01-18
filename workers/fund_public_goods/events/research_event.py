import inngest
from pydantic import BaseModel
from dataclasses import dataclass


@dataclass(slots=True, kw_only=True)
class ResearchParams:
    topic: str
    worker_id: str


class ResearchEvent:
    name: str = "research"
    trigger = inngest.TriggerEvent(event=name)

    class Data(BaseModel):
        params: ResearchParams

        def to_event(self, ts: int = 0):
            return inngest.Event(name=ResearchEvent.name, data=self.model_dump(), ts=ts)
