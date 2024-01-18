import inngest
from fund_public_goods.events import CreateStrategyEvent

@inngest.create_function(
    fn_id="create_strategy",
    trigger=CreateStrategyEvent.trigger,
)
async def create_strategy(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str | None:
    data = CreateStrategyEvent.Data.model_validate(
        ctx.event.data
    )
    prompt = data.prompt
    worker_id = data.worker_id

    """
    - does research
    - emits logs (db) event: "EmitLog" { worker_id, log }
    - finishes with a strategy (db)
    """

    return "Done"
