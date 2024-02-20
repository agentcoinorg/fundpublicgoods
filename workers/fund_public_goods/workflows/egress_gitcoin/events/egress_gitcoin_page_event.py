from pydantic import BaseModel
import inngest

class EgressGitcoinPageEvent():
    name: str = "on_egress_gitcoin_page"
    trigger = inngest.TriggerEvent(event=name)

    class Data(BaseModel):
        job_id: str
        skip_applications: int
        application_page_size: int

        def to_event(self, ts: int = 0):
            return inngest.Event(
                name=EgressGitcoinPageEvent.name,
                data=self.model_dump(),
                ts=ts
            )