import inngest
from fund_public_goods.events.research_event import ResearchEvent

@inngest.create_function(fn_id="on_research", trigger=ResearchEvent.trigger)
async def research(ctx: inngest.Context, step: inngest.Step) -> None:
    pass
