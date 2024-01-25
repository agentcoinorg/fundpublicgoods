from pydantic import BaseModel
import inngest

class IndexGitcoinPageEvent():
    name: str = "on_index_gitcoin_page"
    trigger = inngest.TriggerEvent(event=name)

    class Data(BaseModel):
        url: str
        network_id: int
        job_id: str
        project_page_size: int
        skip_rounds: int
        skip_projects: int

        def to_event(self, ts: int = 0):
            return inngest.Event(
                name=IndexGitcoinPageEvent.name,
                data=self.model_dump(),
                ts=ts
            )