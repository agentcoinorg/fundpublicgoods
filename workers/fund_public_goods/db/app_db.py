import os
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions


load_dotenv()

URL_ENV = "NEXT_PUBLIC_SUPABASE_URL"
ANON_KEY_ENV = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
SERV_KEY_ENV = "SUPABASE_SERVICE_ROLE_KEY"
PINECONE_API_KEY_ENV = "PINECONE_API_KEY"
PINECONE_INDEX_NAME_ENV = "PINECONE_INDEX_NAME"

class Env(BaseModel):
    url: str
    anon_key: str
    serv_key: str
    pinecone_key: str
    pinecone_index: str

def load_env() -> Env:
    url: str | None = os.environ.get(URL_ENV)
    anon_key: str | None = os.environ.get(ANON_KEY_ENV)
    serv_key: str | None = os.environ.get(SERV_KEY_ENV)
    pinecone_key: str | None = os.environ.get(PINECONE_API_KEY_ENV)
    pinecone_index: str | None = os.environ.get(PINECONE_INDEX_NAME_ENV)

    if url is None:
        raise Exception(f"{URL_ENV} is not set")
    if anon_key is None:
        raise Exception(f"{ANON_KEY_ENV} is not set")
    if serv_key is None:
        raise Exception(f"{SERV_KEY_ENV} is not set")
    if pinecone_key is None:
        raise Exception(f"{PINECONE_API_KEY_ENV} is not set")
    if pinecone_index is None:
        raise Exception(f"{PINECONE_INDEX_NAME_ENV} is not set")

    return Env(
        url=url,
        anon_key=anon_key,
        serv_key=serv_key,
        pinecone_key=pinecone_key,
        pinecone_index=pinecone_index
    )

def create(options: ClientOptions = ClientOptions(postgrest_client_timeout=15)) -> Client:
    env = load_env()
    return create_client(env.url, env.anon_key, options)

def create_admin(schema: Optional[str] = None) -> Client:
    env = load_env()

    if schema:
        options = ClientOptions(schema=schema, postgrest_client_timeout=15)
        return create_client(env.url, env.serv_key, options)
    else:
        return create_client(env.url, env.serv_key)
