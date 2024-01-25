from datetime import datetime
from typing import cast
import inngest
from pydantic import parse_obj_as
from fund_public_goods.lib.gitcoin.models import ApplicationInfo, RoundInfo
from fund_public_goods.db.entities import GitcoinApplications, GitcoinProjects
from fund_public_goods.workflows.index_gitcoin.events import IndexGitcoinPageEvent
from fund_public_goods.lib.gitcoin.utils import fetch_json_from_ipfs, fetch_project_applications, fetch_rounds
from fund_public_goods.db.tables.gitcoin import save_application, stop_and_mark_job_as_failed, stop_job, update_job_progress, upsert_project

PAGE_REQUEST_FREQUENCY_SECONDS = 5 # 10 seconds
# PAGE_REQUEST_FREQUENCY_SECONDS = 10 # 10 seconds

async def on_index_gitcoin_page_failure(
    ctx: inngest.Context,
    step: inngest.Step
): 
    error = ctx.event.data["error"]
    data = IndexGitcoinPageEvent.Data.model_validate(cast(dict, ctx.event.data["event"])["data"])
   
    await step.run("stop_and_mark_job_as_failed", lambda: stop_and_mark_job_as_failed(data.job_id, error)) 

@inngest.create_function(
    fn_id="index_gitcoin_page",
    trigger=IndexGitcoinPageEvent.trigger,
    on_failure=on_index_gitcoin_page_failure,
)
async def index_gitcoin_page(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str:
    data = IndexGitcoinPageEvent.Data.model_validate(ctx.event.data)

    rounds = await step.run("fetch_rounds", lambda: fetch_rounds(data.url, first=1, skip=data.skip_rounds))
    rounds = parse_obj_as(list[RoundInfo], rounds)

    if not rounds:
        await step.run("stop_job", lambda: stop_job(data.job_id))

        return "No more rounds"
    
    round = rounds[0]

    apps = await step.run("fetch_project_applications", lambda: fetch_project_applications(data.url, round.id, first=data.project_page_size, skip=data.skip_projects))

    apps = parse_obj_as(list[ApplicationInfo], apps)

    if not apps:
        await step.run("update_job_progress", lambda: update_job_progress(data.job_id, data.skip_rounds + 1, 0))
      
        await step.send_event(
            "index_gitcoin_page", 
            IndexGitcoinPageEvent.Data(
                job_id=data.job_id,
                url = data.url,
                network_id = data.network_id,
                project_page_size = data.project_page_size,
                skip_rounds = data.skip_rounds + 1,
                skip_projects = 0
            ).to_event(ts = future_timestamp(PAGE_REQUEST_FREQUENCY_SECONDS))
        )
        if data.skip_projects == 0:
            return "Next round page: No projects"
        else:
            return "Next round page: No more projects"

    for i in range(len(apps)):
        app = apps[i]

        app_data = await step.run("fetch_json_from_ipfs_" + str(i), lambda: fetch_json_from_ipfs(app.pointer))
        project_id = app_data["application"]["project"]["id"]
        application = GitcoinApplications(
            id = app.id,
            created_at = app.created_at,
            protocol = app.protocol,
            pointer = app.pointer,
            round_id = app.round_id,
            project_id = project_id,
            data = app_data
        )

        project_pointer = app_data["application"]["project"]["metaPtr"]["pointer"]
        project_data = await step.run("fetch_json_from_ipfs_" + str(i), lambda: fetch_json_from_ipfs(project_pointer))
        project = GitcoinProjects(
            id = app_data["application"]["project"]["id"],
            protocol = app_data["application"]["project"]["metaPtr"]["protocol"], 
            pointer = project_pointer,
            data = project_data,
        )

        await step.run("upsert_project_" + str(i), lambda: upsert_project(project))
        
        await step.run("save_application_" + str(i), lambda: save_application(application, data.network_id))

    total_skip_rounds = 0
    total_skip_projects = 0

    if len(apps) < data.project_page_size:
        total_skip_rounds = data.skip_rounds + 1
        total_skip_projects = 0
    else:
        total_skip_rounds = data.skip_rounds
        total_skip_projects = data.skip_projects + data.project_page_size

    await step.run("update_job_progress", lambda: update_job_progress(data.job_id, total_skip_rounds, total_skip_projects))
    
    await step.send_event(
        "index_gitcoin_page", 
        IndexGitcoinPageEvent.Data(
            job_id=data.job_id,
            url = data.url,
            network_id = data.network_id,
            project_page_size = data.project_page_size,
            skip_rounds = total_skip_rounds,
            skip_projects = total_skip_projects,
        ).to_event(ts = future_timestamp(PAGE_REQUEST_FREQUENCY_SECONDS))
    )
    return "Next project page"

def future_timestamp(seconds: float) -> int:
    return int((datetime.now().timestamp() + seconds) * 1000)
