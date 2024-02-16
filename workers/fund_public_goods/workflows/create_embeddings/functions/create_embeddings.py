import inngest
from fund_public_goods.workflows.index_gitcoin.events import IndexGitcoinPageEvent
from fund_public_goods.db.tables.gitcoin import get_non_running_job, is_any_job_running, start_job


@inngest.create_function(
    fn_id="create_embeddings"
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
            return job

    job = await step.run("get_not_running_job", get_not_running_job_step)

    if not job:
        return "No non-running job found"

    await step.run("start_job", lambda: start_job(job["id"]))

    await step.send_event(
        "index_gitcoin_page", 
        IndexGitcoinPageEvent.Data(
            url = job["url"], 
            network_id = job["networkId"],
            project_page_size = 100,
            skip_rounds = job["skipRounds"],
            skip_projects = job["skipProjects"],
            job_id=job["id"]
        ).to_event()
    )

    return "Started job: ID=" + job["id"] + ", URL=" + job["url"]
