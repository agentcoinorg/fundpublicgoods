import inngest
from fund_public_goods.workflows.egress_gitcoin.events import EgressGitcoinPageEvent
from fund_public_goods.db.tables.gitcoin_egress import get_non_running_job, is_any_job_running, start_job

@inngest.create_function(
    fn_id="start_egress_gitcoin",
    trigger=inngest.TriggerCron(cron="* * * * *"), # every 1 minute
    # trigger=inngest.TriggerCron(cron="*/15 * * * *"), # every 15 minutes
)
async def start_egress_gitcoin(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str:
    any_job_running = await step.run("is_any_job_running", lambda: is_any_job_running())
    
    if any_job_running:
        return "A job is already running"

    def get_not_running_job_step():
        job = get_non_running_job()
        if not job:
            return None
        else:
            return job

    job = await step.run("get_not_running_job", get_not_running_job_step)

    if not job:
        return "No non-running job found"

    await step.run("start_job", lambda: start_job(job["id"]))

    await step.send_event(
        "egress_gitcoin_page", 
        EgressGitcoinPageEvent.Data(
            skip_applications = job["skipApplications"],
            job_id=job["id"],
            application_page_size = 100
        ).to_event()
    )

    return "Started job: ID=" + job["id"]
