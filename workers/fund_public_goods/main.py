from dotenv import load_dotenv
from fastapi import FastAPI
import inngest.fast_api
# from mangum import Mangum
from .inngest_client import inngest_client
from .functions import functions
from .api import workers, runs
from .get_version import router as get_version_router

load_dotenv()

app = FastAPI()

inngest.fast_api.serve(
    app,
    inngest_client,
    functions,
)
app.include_router(workers.router)
app.include_router(runs.router)
app.include_router(get_version_router)

# TODO: Only use mangum when environment is production
# handler = Mangum(app=app)
