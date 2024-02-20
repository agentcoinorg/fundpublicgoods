try:
    import unzip_requirements  # type: ignore
except ImportError:
    pass


import sys

# Check if the platform is Linux
if sys.platform == "linux":
    __import__("pysqlite3")
    import sys

    sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")

from dotenv import load_dotenv
from fastapi import FastAPI
import inngest.fast_api
from mangum import Mangum
from fund_public_goods.events import add_event_middleware
from fund_public_goods.inngest_client import inngest_client
from fund_public_goods.workflows.index_gitcoin.functions import (
    functions as index_gitcoin_functions,
)
from fund_public_goods.workflows.egress_gitcoin.functions import (
    functions as egress_gitcoin_functions,
)
from fund_public_goods.api import runs, funding_entries
from fund_public_goods.get_version import router as get_version_router
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

inngest.fast_api.serve(
    app, inngest_client, [*index_gitcoin_functions, *egress_gitcoin_functions]
)
app.include_router(runs.router)
app.include_router(funding_entries.router)
app.include_router(get_version_router)

add_event_middleware(app)
origins = [
    "https://dev.fundpublicgoods.ai",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

handler = Mangum(app=app)
