from typing import cast
from fund_public_goods.lib.strategy.utils.generate_keywords import generate_keywords
import inngest
from pydantic import parse_obj_as
from fund_public_goods.workflows.egress_gitcoin.events import EgressGitcoinPageEvent
from fund_public_goods.workflows.egress_gitcoin.upsert import upsert_application, upsert_project
from fund_public_goods.db.tables.gitcoin_egress import (
    AppWithProject,
    get_application_range,
    stop_and_mark_job_as_failed,
    stop_job,
    update_job_progress,
)

async def on_egress_gitcoin_page_failure(
    ctx: inngest.Context,
    step: inngest.Step
): 
    error = ctx.event.data["error"]
    data = EgressGitcoinPageEvent.Data.model_validate(cast(dict, ctx.event.data["event"])["data"])
   
    await step.run("stop_and_mark_job_as_failed", lambda: stop_and_mark_job_as_failed(data.job_id, error)) 

@inngest.create_function(
    fn_id="egress_gitcoin_page",
    trigger=EgressGitcoinPageEvent.trigger,
    on_failure=on_egress_gitcoin_page_failure,
)
async def egress_gitcoin_page(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str:
    data = EgressGitcoinPageEvent.Data.model_validate(ctx.event.data)

    result = await step.run("fetch_applications", lambda: get_application_range(first=data.application_page_size, skip=data.skip_applications))
    apps_with_project = parse_obj_as(list[AppWithProject], result)

    if not apps_with_project:
        await step.run("stop_job", lambda: stop_job(data.job_id))

        return "No more applications"

    for i in range(len(apps_with_project)):
        project = apps_with_project[i].project
        app = apps_with_project[i].app
        
        await step.run("upsert_project_" + str(i), lambda: upsert_project(project, app.created_at))
        
        await step.run("upsert_application_" + str(i), lambda: upsert_application(app))

    total_skip_applications = data.skip_applications + len(apps_with_project)

    await step.run("update_job_progress", lambda: update_job_progress(data.job_id, total_skip_applications))
    
    await step.send_event(
        "egress_gitcoin_page", 
        EgressGitcoinPageEvent.Data(
            job_id=data.job_id,
            application_page_size = data.application_page_size,
            skip_applications = total_skip_applications,
        ).to_event()
    )
    return "Next project page"
