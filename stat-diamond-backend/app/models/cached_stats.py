from sqlalchemy import Column, String, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from app.database import Base
import uuid
from datetime import datetime


class CachedStats(Base): 
  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  stat_type = Column(String(50), nullable=False)
  season = Column(Integer, nullable=False)
  data = Column(JSONB, nullable=False)
  cached_at = Column(DateTime, default=datetime.utcnow)
  expires_at = Column(DateTime, nullable=False)

  __table_args__ = (
      Index('idx_cached_stats_lookup', 'stat_type', 'season', 'expires_at'),
  )
