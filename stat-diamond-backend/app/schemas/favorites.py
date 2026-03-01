from pydantic import BaseModel
from uuid import UUID 
from datetime import datetime 


## Schemas for adding favorite player
class FavoritePlayerCreate(Basemodel): 
  player_id: str
  player_name: str

#Schema for returning a favorite player
class FavoritePlayerResponse(Basemodel): 
  id: UUID
  user_id: UUID 
  player_id: str
  player_name: str
  datetime: datetime
  class Config: 
    from_attributes: True

# Schema for adding a favorite team
class FavoriteTeamCreate(BaseModel): 
  team_id: str
  team_name: str

#Scema for returning favorite team
class FavoriteTeamResponse: 
  id: UUID 
  user_id: UUID
  team_id: str 
  team_name: str 
  datetime: datetime
  class Config: 
    from_attributes: True