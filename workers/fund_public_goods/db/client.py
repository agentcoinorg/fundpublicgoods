import os
from typing import Optional
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

def create(options: ClientOptions = ClientOptions()) -> Client:
    url: str | None = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key: str | None = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if url is None:
        raise Exception("NEXT_PUBLIC_SUPABASE_URL is not set")
    if key is None:
        raise Exception("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")

    return create_client(url, key)

def create_admin(schema: Optional[str] = None) -> Client:
    url: str | None = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key: str | None = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if url is None:
        raise Exception("NEXT_PUBLIC_SUPABASE_URL is not set")
    if key is None:
        raise Exception("SUPABASE_SERVICE_ROLE_KEY is not set")

    if schema:
        options = ClientOptions(schema=schema)
        return create_client(url, key, options)
    else:
        return create_client(url, key)
