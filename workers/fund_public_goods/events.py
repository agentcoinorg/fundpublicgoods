try:
  import unzip_requirements # type: ignore
except ImportError:
  pass

import sys

# Check if the platform is Linux
if sys.platform == "linux":
    __import__('pysqlite3')
    import sys
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

from dataclasses import dataclass
from typing import Any, Union
from aws_lambda_typing.events import SQSEvent
from aws_lambda_typing.context import Context
from fastapi_events.typing import Event as LocalEvent
from fastapi_events.handlers.local import local_handler, BaseEventHandler
from fastapi_events.handlers.aws import SQSForwardHandler
from fastapi_events.middleware import EventHandlerASGIMiddleware
from fund_public_goods.lib.strategy.create import create
import os
import json
from fastapi import FastAPI

@dataclass
class EventData:
    name: str
    payload: dict[str, Any]

def handler(event: EventData):
    if event.name == "create-strategy":
        run_id = event.payload["run_id"]
        authorization = event.payload["authorization"]
        create(run_id, authorization)
    else:
        raise Exception("Unknown event name!")

@local_handler.register(event_name="*")
def local_handle(local_event: LocalEvent):
    event_name, payload = local_event
    event = EventData(name=str(event_name), payload=payload)
    handler(event)

def sqs_handler(sqs_event: SQSEvent, _: Context):
    events: list[EventData] = []

    for record in sqs_event['Records']:
        message_body = record['body']
        message = json.loads(message_body)
        events.append(EventData(
            name=message[0],
            payload=message[1]
        ))

    for event in events:
        try:
            handler(event)
        except Exception as error:
            print(error)

def add_event_middleware(app: FastAPI):
    event_handlers: list[BaseEventHandler] = []
    env = os.getenv("RUNTIME")

    if env == "cloud":
        event_handlers = [
            SQSForwardHandler(
                queue_url="https://sqs.us-east-1.amazonaws.com/815880329304/fpg",
                region_name="us-east-1"
            )
        ]
    else:
        event_handlers = [local_handler]

    app.add_middleware(
        EventHandlerASGIMiddleware,
        handlers=event_handlers
    )
