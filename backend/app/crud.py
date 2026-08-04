import os
from supabase import create_client, Client
from dotenv import load_dotenv
from .models import SnippetCreate

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
secret: str = os.environ.get("SUPABASE_KEY", "") or os.environ.get("SUPABASE_SERVICE_ROLE", "")

supabase: Client = create_client(url, secret)

# --- Snippets Operations ---
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

# --- Custom Users Operations ---
def create_user(username: str, password_hash: str):
    data = {
        "username": username,
        "password_hash": password_hash
    }
    response = supabase.table("users").insert(data).execute()
    return response.data[0] if response.data else None

def get_user_by_username(username: str):
    response = supabase.table("users").select("*").eq("username", username).execute()
    return response.data[0] if response.data else None
