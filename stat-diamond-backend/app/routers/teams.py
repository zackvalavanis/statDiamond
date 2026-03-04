from fastapi import APIRouter, Query, HTTPException
from pybaseball import batting_stats
import pandas as pd
import numpy as np
import math

def sanitize_value(val):
    """Convert any non-JSON-serializable value to None."""
    if val is None:
        return None
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return None
    # catch numpy types
    if isinstance(val, (np.floating, np.integer)):
        if np.isnan(val) or np.isinf(val):
            return None
        return val.item()  # convert numpy scalar to Python native type
    if isinstance(val, np.bool_):
        return bool(val)
    if pd.isna(val):
        return None
    return val

def clean_records(df: pd.DataFrame) -> list[dict]:
    """Convert DataFrame to list of dicts with all values JSON-safe."""
    records = df.to_dict(orient="records")
    return [
        {k: sanitize_value(v) for k, v in row.items()}
        for row in records
    ]

router = APIRouter(prefix="/api/teams", tags=["teams"])

@router.get('/{team_id}/roster')
def get_team_roster(team_id: str, season: int = 2025):  # ← Add colon
    """Get all players for a specific team"""
    try:
        df = batting_stats(season, season, qual=1)
        team_players = df[df['Team'] == team_id]
        
        if team_players.empty:
            return []
        
        return clean_records(team_players)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch roster: {e}")

@router.get("/{team_id}/stats")
def get_team_stats(team_id: str, season: int = 2024):
    """Get aggregated team stats"""
    try:
        df = batting_stats(season, season, qual=1)
        team_players = df[df['Team'] == team_id]
        
        if team_players.empty:
            return {"error": "No data for this team"}
        
        # Calculate team totals
        stats = {
            "team_id": team_id,
            "season": season,
            "total_hr": int(team_players['HR'].sum()) if 'HR' in team_players else 0,
            "total_rbi": int(team_players['RBI'].sum()) if 'RBI' in team_players else 0,
            "avg_batting_avg": float(team_players['AVG'].mean()) if 'AVG' in team_players else 0,
            "player_count": len(team_players)
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch team stats: {e}")