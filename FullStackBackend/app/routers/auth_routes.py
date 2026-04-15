from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse, Token
from app.services.auth_service import register_user, authenticate_user
from app.utils.security import get_current_user
from app.utils.response import success

router = APIRouter()


@router.post("/register", summary="Register a new user")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, payload)
    return success(UserResponse.model_validate(user), "User registered successfully")


@router.post("/login", response_model=Token, summary="Login and receive JWT")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user, token = authenticate_user(db, payload.email, payload.password)
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.model_validate(user)}


@router.get("/me", summary="Get current user profile")
def me(current_user: User = Depends(get_current_user)):
    return success(UserResponse.model_validate(current_user))
