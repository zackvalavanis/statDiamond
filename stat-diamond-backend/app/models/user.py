from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base
from sqlalchemy.orm import relationship


# okay user will need user_id, user_name, email, 


class User(Base): 
  __tablename__ = "users" #instructs sqlalchemy what to call the table
  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # Column defines each column and uuid is a more secure version of int for user ids , uuid.uuid4 generates id's
  email = Column(String, unique=True, index=True, nullable=False) 
  hashed_password = Column(String, nullable=False) # we never store plane passwords itll be hashed
  name = Column(String, nullable=False) #Nullable=false means that it is required
  created_at = Column(DateTime, default=datetime.utcnow) #adds a timestamp 
  is_active = Column(Boolean, nullable=False, default=True)
  favorite_players = relationship("FavoritePlayer", back_populates="user")
  favorite_teams = relationship("FavoriteTeam", back_populates="user")

