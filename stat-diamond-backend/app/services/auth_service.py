from passlib.context import CryptContext  #Bcrypt 
from jose import JWTError, jwt # JWT creation / verification library 
from datetime import datetime, timedelta #token expiry 
from app.config import settings #your secret key and config


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # creates a hasher, uses the bcrypt algorithm, auto upgrades old hashing methods if needed


def hash_password(password: str) -> str: 
  """Hash a password using bcrypt"""
  return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool: 
  """Verify password against a hash"""
  return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None=None) -> str:
  """ Create a JWT Access Token """
  to_encode = data.copy()
  if expires_delta: 
    expire = datetime.utcnow() + expires_delta
  else: 
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
  return encoded_jwt 

def decode_access_token(token: str) -> dict | None: 
  """ Decode and verify JWT Token """
  try: 
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return payload
  except JWTError: 
    return None