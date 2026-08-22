import os

from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()


def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")

    if not url:
        raise ValueError("SUPABASE_URL is not configured.")

    if not key:
        raise ValueError("SUPABASE_SECRET_KEY is not configured.")

    return create_client(url, key)