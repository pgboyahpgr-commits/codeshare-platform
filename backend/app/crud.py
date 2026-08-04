import os
from supabase import create_client, Client
from dotenv import load_dotenv
from .models import SnippetCreate

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
# Use the service role secret to perform backend db updates
secret: str = os.environ.get("SUPABASE_SECRET", "") or os.environ.get("SUPABASE_KEY", "")

supabase: Client = create_client(url, secret)

def create_snippet(snippet: SnippetCreate, user_id: str):
    data = {
        "title": snippet.title,
        "content": snippet.content,
        "language": snippet.language,
        "is_public": snippet.is_public,
        "user_id": user_id
    }
    response = supabase.table("snippets").insert(data).execute()
    return response.data[0] if response.data else None

def get_snippet(snippet_id: str):
    response = supabase.table("snippets").select("*").eq("id", snippet_id).execute()
    return response.data[0] if response.data else None

def list_snippets():
    response = supabase.table("snippets").select("*").eq("is_public", True).execute()
    return response.data
