from fund_public_goods.lib.strategy.utils.fetch_matching_projects import fetch_matching_projects
import inngest
from pydantic import BaseModel
import json

class FetchProjectsEvent:
    name: str = "on_fetch_projects"
    trigger = inngest.TriggerEvent(event=name)

    class Data(BaseModel):
        prompt: str

        def to_event(self, ts: int = 0):
            return inngest.Event(
                name=FetchProjectsEvent.name,
                data=self.model_dump(),
                ts=ts
            )

@inngest.create_function(
    fn_id="fetch_projects",
    trigger=FetchProjectsEvent.trigger,
)
async def fetch_projects(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str | None:
    data = FetchProjectsEvent.Data.model_validate(ctx.event.data)
    
    return json.dumps(fetch_matching_projects(data.prompt))
