import inngest
from pydantic import BaseModel


class InitializeStrategyEvent:
    name: str = "on_initialize_strategy"
    trigger = inngest.TriggerEvent(event=name)

    class Data(BaseModel):
        run_id: str

        def to_event(self, ts: int = 0):
            return inngest.Event(
                name=InitializeStrategyEvent.name, data=self.model_dump(), ts=ts
            )
