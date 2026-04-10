from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.favorites import (
    FavoritePlayerCreate, 
    FavoritePlayerResponse,
    FavoriteTeamCreate,
    FavoriteTeamResponse
)
from app.models.favorite_player import FavoritePlayer
from app.models.favorite_team import FavoriteTeam
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.post("/players", response_model=FavoritePlayerResponse, status_code=status.HTTP_201_CREATED)
def add_favorite_player(
  player_data: FavoritePlayerCreate, 
  current_user: User = Depends(get_current_user), 
  db: Session = Depends(get_db)
):
  """Add a player to user's favorites"""

  existing = db.query(FavoritePlayer).filter(
    FavoritePlayer.user_id == current_user.id, 
    FavoritePlayer.player_id == player_data.player_id
  ).first()

  if existing: 
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Player already in favorites"
    )
  
  """Create a new favorite"""

  favorite = FavoritePlayer(
    user_id = current_user.id,
    player_id = player_data.player_id,
    player_name = player_data.player_name
  )

  db.add(favorite)
  db.commit()
  db.refresh(favorite)

  return favorite

@router.get("/players", response_model=list[FavoritePlayerResponse])
def get_favorite_players(
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
) : 
  """ Retrieves favorite players list """
  favorites = db.query(FavoritePlayer).filter(
    FavoritePlayer.user_id == current_user.id
  ).all()

  return favorites

@router.post("/teams", response_model=FavoriteTeamResponse, status_code=status.HTTP_201_CREATED)
def add_favorite_team(
    team_data: FavoriteTeamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a team to user's favorites"""

    # Check if already exists
    existing = db.query(FavoriteTeam).filter(
        FavoriteTeam.user_id == current_user.id,
        FavoriteTeam.team_id == team_data.team_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team already in favorites"
        )

    # Create new favorite team
    favorite = FavoriteTeam(
        user_id=current_user.id,
        team_id=team_data.team_id,
        team_name=team_data.team_name
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return favorite