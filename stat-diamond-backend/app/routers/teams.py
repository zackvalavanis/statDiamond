from fastapi import APIRouter, Query, HTTPException
from pybaseball import batting_stats
import pandas as pd
import numpy as np
import math
import requests
import unicodedata


TEAM_ABBREV = {
    "Arizona Diamondbacks": "ARI",
    "Atlanta Braves": "ATL",
    "Baltimore Orioles": "BAL",
    "Boston Red Sox": "BOS",
    "Chicago Cubs": "CHC",
    "Chicago White Sox": "CHW",
    "Cincinnati Reds": "CIN",
    "Cleveland Guardians": "CLE",
    "Colorado Rockies": "COL",
    "Detroit Tigers": "DET",
    "Houston Astros": "HOU",
    "Kansas City Royals": "KCR",
    "Los Angeles Angels": "LAA",
    "Los Angeles Dodgers": "LAD",
    "Miami Marlins": "MIA",
    "Milwaukee Brewers": "MIL",
    "Minnesota Twins": "MIN",
    "New York Mets": "NYM",
    "New York Yankees": "NYY",
    "Oakland Athletics": "OAK",
    "Philadelphia Phillies": "PHI",
    "Pittsburgh Pirates": "PIT",
    "San Diego Padres": "SDP",
    "San Francisco Giants": "SFG",
    "Seattle Mariners": "SEA",
    "St. Louis Cardinals": "STL",
    "Tampa Bay Rays": "TBR",
    "Texas Rangers": "TEX",
    "Toronto Blue Jays": "TOR",
    "Washington Nationals": "WSN",
}


MLB_TEAM_IDS = {
    "Arizona Diamondbacks": 109,
    "Atlanta Braves": 144,
    "Baltimore Orioles": 110,
    "Boston Red Sox": 111,
    "Chicago Cubs": 112,
    "Chicago White Sox": 145,
    "Cincinnati Reds": 113,
    "Cleveland Guardians": 114,
    "Colorado Rockies": 115,
    "Detroit Tigers": 116,
    "Houston Astros": 117,
    "Kansas City Royals": 118,
    "Los Angeles Angels": 108,
    "Los Angeles Dodgers": 119,
    "Miami Marlins": 146,
    "Milwaukee Brewers": 158,
    "Minnesota Twins": 142,
    "New York Mets": 121,
    "New York Yankees": 147,
    "Oakland Athletics": 133,
    "Philadelphia Phillies": 143,
    "Pittsburgh Pirates": 134,
    "San Diego Padres": 135,
    "San Francisco Giants": 137,
    "Seattle Mariners": 136,
    "St. Louis Cardinals": 138,
    "Tampa Bay Rays": 139,
    "Texas Rangers": 140,
    "Toronto Blue Jays": 141,
    "Washington Nationals": 120,
}

def normalize_name(name: str) -> str:
    # Remove accents
    name = unicodedata.normalize('NFD', name)
    name = ''.join(c for c in name if unicodedata.category(c) != 'Mn')
    # Lowercase and strip suffixes
    name = name.lower().strip()
    for suffix in [' jr.', ' jr', ' sr.', ' sr', ' ii', ' iii', ' iv']:
        name = name.replace(suffix, '')
    return name.strip()



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
def get_team_roster(team_id: str, season: int = 2024):
    mlb_id = MLB_TEAM_IDS.get(team_id)
    abbrev = TEAM_ABBREV.get(team_id, team_id)
    
    if not mlb_id:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get roster with positions from MLB API
    url = f"https://statsapi.mlb.com/api/v1/teams/{mlb_id}/roster?season={season}"
    res = requests.get(url)
    roster_data = res.json().get("roster", [])
    
    # Build a position lookup by player name
    positions = {
    normalize_name(p["person"]["fullName"]): p["position"]["abbreviation"]
    for p in roster_data
    }
    
    # Get batting stats from pybaseballa
    df = batting_stats(season, season, qual=1)
    team_players = df[df['Team'] == abbrev]
    
    # Add position to each player
    team_players["Position"] = team_players["Name"].map(
        lambda n: positions.get(normalize_name(n))
    )
        
    return clean_records(team_players)

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