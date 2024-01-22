from dotenv import load_dotenv
from fastapi import FastAPI
import inngest.fast_api
from mangum import Mangum
from fund_public_goods.gitcoin.functions import functions as gitcoin_functions
from .inngest_client import inngest_client
from .functions import functions
from .api import workers
from .get_version import router as get_version_router

load_dotenv()

app = FastAPI()

inngest.fast_api.serve(
    app,
    inngest_client,
    functions + gitcoin_functions,
)
app.include_router(workers.router)
app.include_router(get_version_router)

handler = Mangum(app=app)
