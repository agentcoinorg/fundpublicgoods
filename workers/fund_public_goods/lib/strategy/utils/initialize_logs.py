from fund_public_goods.db.entities import StepName
from fund_public_goods.db.tables import logs
from fund_public_goods.db.entities import Logs, StepStatus, StepName


def initialize_logs(run_id: str):
    logs.insert_multiple([
        Logs(
            run_id=run_id,
            status=StepStatus.NOT_STARTED.value,
            step_name=step_name.value,
        )
        for step_name in StepName
    ])
