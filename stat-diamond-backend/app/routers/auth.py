from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import UserCreate, UserResponse, Token
from app.models.user import User
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.dependencies import get_current_user


router = APIRouter(prefix="/api/auth", tags=["authentication"])


# -----------------------------
# SIGNUP
# -----------------------------
@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = hash_password(user_data.password)

    new_user = User(
        email=user_data.email,
        name=getattr(user_data, "name", None),  # prevents crash if missing
        hashed_password=hashed_password,
        is_active=True,  # 🔥 FIX for NOT NULL DB error
    )

    db.add(new_user)

    try:
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"User creation failed: {str(e)}",
        )

    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# -----------------------------
# LOGIN
# -----------------------------
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# -----------------------------
# ME
# -----------------------------
@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user