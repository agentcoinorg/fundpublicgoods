import os
from supabase import create_client, Client


def create_admin() -> Client:
    url: str | None = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key: str | None = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if url is None:
        raise Exception("NEXT_PUBLIC_SUPABASE_URL is not set")
    if key is None:
        raise Exception("SUPABASE_SERVICE_ROLE_KEY is not set")

    return create_client(url, key)
