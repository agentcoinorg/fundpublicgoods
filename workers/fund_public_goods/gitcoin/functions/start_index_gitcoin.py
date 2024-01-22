import inngest
from fund_public_goods.gitcoin.events import IndexGitcoinPageEvent
from fund_public_goods.db.operations import get_non_running_job, is_any_job_running, start_job
from fund_public_goods.gitcoin.models import GitcoinIndexingJob

@inngest.create_function(
    fn_id="start_index_gitcoin",
    # trigger=inngest.TriggerCron(cron="* * * * *"), # every 1 minute
    trigger=inngest.TriggerCron(cron="*/15 * * * *"), # every 15 minutes
)
async def start_index_gitcoin(
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
            return job.model_dump()

    job_dto = await step.run("get_not_running_job", get_not_running_job_step)

    if not job_dto:
        return "No non-running job found"

    job = GitcoinIndexingJob.model_validate(job_dto)

    await step.run("start_job", lambda: start_job(job.id))

    await step.send_event(
        "index_gitcoin_page", 
        IndexGitcoinPageEvent.Data(
            url = job.url, 
            project_page_size = 100,
            skip_rounds = job.skip_rounds,
            skip_projects = job.skip_projects,
            job_id=job.id
        ).to_event()
    )

    return "Started job: ID=" + job.id + ", URL=" + job.url
