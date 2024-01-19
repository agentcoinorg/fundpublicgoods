import os
from inngest import Inngest

inngest_client = Inngest(
    app_id="fund_public_goods_ai",
    is_production=os.getenv("INNGEST_PROD") == "true",
    event_key=os.getenv("INNGEST_EVENT_KEY"),
)