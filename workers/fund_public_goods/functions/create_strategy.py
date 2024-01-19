import inngest
import datetime
from fund_public_goods.events import CreateStrategyEvent
from fund_public_goods.db import logs


@inngest.create_function(
    fn_id="on_create_strategy",
    trigger=CreateStrategyEvent.trigger,
)
async def create_strategy(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str | None:
    data = CreateStrategyEvent.Data.model_validate(ctx.event.data)
    prompt = data.prompt
    run_id = data.run_id

    await step.run(
        "getting_info",
        lambda: logs.insert(run_id, "Getting information from data sources"),
    )

    await step.sleep("zzzz1", datetime.timedelta(seconds=3))
    await step.run(
        "assessing",
        lambda: logs.insert(
            run_id,
            "Assessing impact of each project realted to the users interest",
        ),
    )

    await step.sleep("zzzz2", datetime.timedelta(seconds=3))
    await step.run(
        "determine",
        lambda: logs.insert(
            run_id,
            "Determining the relative funding that the best matching projects need",
        ),
    )

    await step.sleep("zzzz3", datetime.timedelta(seconds=3))
    await step.run("result", lambda: logs.insert(run_id, "Generating results"))

    await step.sleep("zzzz4", datetime.timedelta(seconds=3))
    await step.run("result", lambda: logs.insert(run_id, "STRATEGY_CREATED"))

    return "Done"
