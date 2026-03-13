from fastapi import APIRouter, Query, HTTPException
from pybaseball import statcast, statcast_pitcher, playerid_lookup, batting_stats, pitching_stats
import numpy as np
import pandas as pd
import math



router = APIRouter(prefix="/stats", tags=["stats"])


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


@router.get("/statcast")
def get_statcast_data(
    start: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end: str = Query(..., description="End date (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=1000),
):
    """Fetch raw Statcast data for a date range."""
    try:
        df = statcast(start_dt=start, end_dt=end)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch Statcast data: {e}")

    if df is None or df.empty:
        return []

    return clean_records(df.head(limit))


@router.get("/player/lookup")
def lookup_player(
    first: str = Query(..., description="Player first name"),
    last: str = Query(..., description="Player last name"),
):
    """Look up a player's IDs by name."""
    try:
        result = playerid_lookup(last, first)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Player lookup failed: {e}")

    if result is None or result.empty:
        raise HTTPException(status_code=404, detail=f"No player found: {first} {last}")

    return clean_records(result)




@router.get('/player/pitching')
def get_pitching_stats(
    start: int = Query(..., description="Start season (e.g. 2024)"),
    end: int = Query(..., description="End season (e.g. 2025)"),
    min_ip: int = Query(1, description="Minimum innings pitched qualifier")
):
    """Fetch aggregate pitching statistics using Fangraphs"""
    try:
        df = pitching_stats(start, end, qual=min_ip)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch pitching data: {e}")
    if df is None or df.empty:
        return []
    return clean_records(df)

@router.get('/player/batting')
def get_batting_stats(
    start: int = Query(..., description="Start season (e.g. 2024)"), 
    end: int = Query(..., description="End season (e.g. 2025)"), 
    min_pa: int = Query(1, description="Minimum plate appearances (default: 1 for all players)")  # Add this
    ): 
    """Fetch Aggregate statistics using Fangraphs"""
    try: 
        df = batting_stats(start, end, qual=min_pa)
    except Exception as e: 
        raise HTTPException(status_code=502, detail=f"Failed to fetch batting data: {e}")
    if df is None or df.empty: 
        return []
    
    return clean_records(df)

from pybaseball import batting_stats_bref  # Add this import at the top

@router.get('/player/roster')
def get_roster(
    start: int = Query(..., description="Start season (e.g. 2024)"), 
    end: int = Query(None, description="End season (optional, defaults to start)"),  # BRef only does one season
    min_pa: int = Query(1, description="Minimum plate appearances")
): 
    """Fetch batting statistics using Baseball Reference"""
    try:
        # Baseball Reference can only do one season at a time
        season = start
        df = batting_stats_bref(season)
        
        # Filter by minimum PA if needed
        if min_pa > 1:
            df = df[df['PA'] >= min_pa]
            
    except Exception as e: 
        raise HTTPException(status_code=502, detail=f"Failed to fetch batting data: {e}")
    
    if df is None or df.empty: 
        return []
    
    return clean_records(df)
