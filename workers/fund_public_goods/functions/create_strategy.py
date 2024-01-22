import inngest
import datetime
from fund_public_goods.events import CreateStrategyEvent
from fund_public_goods.db import client, logs, projects, strategy_entries

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
    supabase = client.create_admin()

    await step.run(
        "getting_info",
        lambda: logs.insert(
            supabase,
            run_id,
            "Getting information from data sources"
        ),
    )

    await step.run(
        "add_mock_data",
        lambda: add_mock_data(supabase, run_id)
    )

    await step.run(
        "assessing",
        lambda: logs.insert(
            supabase,
            run_id,
            "Assessing impact of each project realted to the users interest",
        ),
    )

    await step.run(
        "determine",
        lambda: logs.insert(
            supabase,
            run_id,
            "Determining the relative funding that the best matching projects need",
        ),
    )

    await step.run("result", lambda: logs.insert(
        supabase,
        run_id,
        "Generating results"
    ))

    await step.run("result", lambda: logs.insert(
        supabase,
        run_id,
        "STRATEGY_CREATED"
    ))

    return "Done"
