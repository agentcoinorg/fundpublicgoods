import os
from inngest import Inngest

inngest_client = Inngest(
    app_id="send_tokens",
    is_production=os.getenv("INNGEST_PROD") == "true",
    event_key=os.getenv("INNGEST_EVENT_KEY"),
)
