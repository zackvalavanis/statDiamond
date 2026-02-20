from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer #extracts token from request headers
from sqlalchemy.orm import Session #database session
from app.database import get_db
from app.services.auth_service import decode_access_token #function to decode JWT
from app.models.user import User # your db model 



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login") #Tells fastapi to look for tokens in the authorization header, and where to get them 

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User: # step 1 get the token
  """
  Dependancy to get the current authenticated user from the JWT token 
  """
  credentials_exception = HTTPException (    #prepare error responses
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )

  #decode the token
  payload = decode_access_token(token) #calls decode_access_token withthe token that it retrieved
  if payload is None: 
    raise credentials_exception 

  user_id: str = payload.get("sub") #extract user id from the token "sub" is the standard JWT field for "subject" (who the token is for)
  if user_id is None: 
    raise credentials_exception

  user = db.query(User).filter(User.id == user_id).first() #Look up user in the database
  if user is None: 
    raise credentials_exception
  
  return user #return the user with that id


