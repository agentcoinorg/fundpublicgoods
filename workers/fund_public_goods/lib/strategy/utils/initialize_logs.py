import json
from fund_public_goods.db.entities import StepName
from fund_public_goods.db.tables import logs


def initialize_logs(run_id: str) -> str:
    log_ids: dict[StepName, str] = {}

    for step_name in StepName:
        new_log = logs.create(
            run_id=run_id,
            step_name=step_name,
        ).data
        
        log_ids[step_name] = new_log[0]["id"]

    return json.dumps(log_ids)