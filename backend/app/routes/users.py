from fastapi import APIRouter, HTTPException, status
from ..models import UserCreate, UserLogin
from .. import crud
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register")
def register(user_data: UserCreate):
    # Check if username already exists
    existing_user = crud.get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Hash password and create user
    pwd_hash = hash_password(user_data.password)
    new_user = crud.create_user(user_data.username, pwd_hash)
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating user"
        )
    
    # Generate token
    token = create_access_token(str(new_user["id"]), new_user["username"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user["id"],
            "username": new_user["username"]
        }
    }

@router.post("/login")
def login(user_data: UserLogin):
    user = crud.get_user_by_username(user_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password hash
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Generate token
    token = create_access_token(str(user["id"]), user["username"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"]
        }
    }
