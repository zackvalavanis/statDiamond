from pydantic import BaseModel, EmailStr
from uuid import UUID 
from datetime import datetime 



class UserCreate(BaseModel): 
  email: EmailStr
  password: str
  name: str

class UserResponse(BaseModel): 
  id: UUID
  email: EmailStr
  name: str
  created_at: datetime

  class Config: 
    from_attributes = True


class Token(BaseModel): 
  access_token: str   #JWT Token String 
  token_type: str     # Always Bearer ~ standard OAUTH2 Format

class TokenData(BaseModel):
  user_id: str | None = None
  