from pydantic import BaseModel
import inngest

class IngestProjectsEvent():
    name: str = "on_ingest_projects"
    trigger = inngest.TriggerEvent(event=name)

    class Data(BaseModel):
        def to_event(self, ts: int = 0):
            return inngest.Event(
                name=IngestProjectsEvent.name,
                data=self.model_dump(),
                ts=ts
            )