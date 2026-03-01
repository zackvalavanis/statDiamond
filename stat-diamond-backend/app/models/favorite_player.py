from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base
from sqlalchemy.orm import relationship 

class FavoritePlayer(Base): 
  __tablename__ = 'favorite_players'
  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
  players_id = Column(String, nullable=False)
  players_name = Column(String, nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)

  user = relationship("User", back_populates="favorite_players")
