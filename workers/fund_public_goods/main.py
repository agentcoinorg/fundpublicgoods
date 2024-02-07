try:
  import unzip_requirements # type: ignore
except ImportError:
  pass

from fastapi import FastAPI
import inngest.fast_api
from mangum import Mangum
from fund_public_goods.inngest_client import inngest_client
from fund_public_goods.workflows.index_gitcoin.functions import functions as gitcoin_functions
from fund_public_goods.workflows.create_strategy.functions import functions as worker_functions
from fund_public_goods.api import runs, funding_entries
from fund_public_goods.get_version import router as get_version_router

app = FastAPI(title="Fund Public Goods", debug=False)

inngest.fast_api.serve(app, inngest_client, [*worker_functions, *gitcoin_functions])
app.include_router(runs.router)
app.include_router(funding_entries.router)
app.include_router(get_version_router)

handler = Mangum(app=app)
