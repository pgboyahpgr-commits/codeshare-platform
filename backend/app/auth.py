import os
from fastapi import Header, HTTPException, status
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
# Use the service role secret if available, otherwise fallback to key
# The service role key allows querying/verifying user tokens safely
secret: str = os.environ.get("SUPABASE_SECRET", "") or os.environ.get("SUPABASE_KEY", "")

supabase_admin: Client = create_client(url, secret)

def get_current_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    try:
        # Verify token with Supabase Auth
        res = supabase_admin.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid auth token"
            )
        return str(res.user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Auth error: {str(e)}"
        )
