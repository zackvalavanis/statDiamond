from fastapi import APIRouter, Depends, HTTPException, status  #creates router like a rails controller
from fastapi.security import OAuth2PasswordRequestForm #handles form data
from sqlalchemy.orm import Session #database session 
from app.database import get_db
from app.schemas.auth import UserCreate, UserResponse, Token
from app.models.user import User
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user


router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)): 
  """
  Create a new user account
  """

  existing_user = db.query(User).filter(User.email == user_data.email).first()
  if existing_user: 
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST, 
      detail="Email already registered"
    )

  #create new user
  hashed_password = hash_password(user_data.password)
  new_user = User(
    email = user_data.email, 
    name = user_data.name, 
    hashed_password = hashed_password
  )

  db.add(new_user)
  db.commit()
  db.refresh(new_user)

  access_token = create_access_token(data={"sub": str(new_user.id)})
  return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)): 
  """
  Login with email and password
  Note: OAuth2PasswordRequestForm uses 'username' field, but we use it for email
  """
  user = db.query(User).filter(User.email == form_data.username).first()

  if not user or not verify_password(form_data.password, user.hashed_password): 
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED, 
      detail="Incorrect email or password", 
      headers= {"WWW-Authenticate" : "Bearer"},
    )
  access_token = create_access_token(data={"sub": str(user.id)})
  return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)): 
  """
  Gets current authenticated Users information
  """
  return current_user