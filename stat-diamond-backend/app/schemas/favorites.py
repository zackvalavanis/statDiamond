from pydantic import BaseModel
from uuid import UUID 
from datetime import datetime 


## Schemas for adding favorite player
class FavoritePlayerCreate(BaseModel): 
  player_id: str
  player_name: str

#Schema for returning a favorite player
class FavoritePlayerResponse(BaseModel): 
  id: UUID
  user_id: UUID 
  player_id: str
  player_name: str
  created_at: datetime
  class Config: 
    from_attributes: True

# Schema for adding a favorite team
class FavoriteTeamCreate(BaseModel): 
  team_id: str
  team_name: str

#Scema for returning favorite team
class FavoriteTeamResponse(BaseModel): 
  id: UUID 
  user_id: UUID
  team_id: str 
  team_name: str 
  created_at: datetime
  class Config: 
    from_attributes: True