from fund_public_goods.workflows.create_strategy.events import InitializeStrategyEvent
from fund_public_goods.workflows.create_strategy.events.create_strategy_event import CreateStrategyEvent
import inngest

@inngest.create_function(
    fn_id="initialize_strategy",
    trigger=InitializeStrategyEvent.trigger
)
async def initialize_strategy(
    ctx: inngest.Context,
    step: inngest.Step
) -> str | None:
    data = InitializeStrategyEvent.Data.model_validate(ctx.event.data)

    await step.send_event("create_strategy", CreateStrategyEvent.Data(
        run_id=data.run_id
    ).to_event())

    return "Started creation of strategy for run with ID=" + data.run_id