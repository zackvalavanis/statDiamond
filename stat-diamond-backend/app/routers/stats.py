from fastapi import APIRouter, Query, HTTPException, Depends
from pybaseball import batting_stats, pitching_stats, playerid_lookup, chadwick_register
from functools import lru_cache
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import numpy as np
import pandas as pd
import math
import unicodedata
import requests

from app.routers.teams import MLB_TEAM_IDS
from app.models.cached_stats import CachedStats
from app.dependencies import get_db


@lru_cache(maxsize=1)
def get_id_mapping():
    reg = chadwick_register()
    return dict(zip(reg['key_fangraphs'], reg['key_mlbam']))

@lru_cache(maxsize=10)
def get_all_positions(season: int) -> dict:
    positions = {}
    for team_name, mlb_id in MLB_TEAM_IDS.items():
        url = f"https://statsapi.mlb.com/api/v1/teams/{mlb_id}/roster?season={season}"
        res = requests.get(url)
        roster_data = res.json().get("roster", [])
        for p in roster_data:
            positions[normalize_name(p["person"]["fullName"])] = p["position"]["abbreviation"]
    return positions


router = APIRouter(prefix="/stats", tags=["stats"])

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

@router.get('/player/pitching')
def get_pitching_stats(
    start: int = Query(..., description="Start season (e.g. 2024)"),
    end: int = Query(..., description="End season (e.g. 2025)"),
    min_ip: int = Query(1, description="Minimum innings pitched qualifier")
):
    try:
        df = pitching_stats(start, end, qual=min_ip)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch pitching data: {e}")
    if df is None or df.empty:
        return []

    fg_to_mlb = get_id_mapping()
    positions = get_all_positions(start)
    df = df.copy()
    df["Position"] = df["Name"].map(lambda n: positions.get(normalize_name(n)))
    df["key_mlbam"] = df["IDfg"].map(fg_to_mlb)
    return clean_records(df)

@router.get("/player/batting")
def get_batting_stats(
    start: int, 
    end: int, 
    min_pa: int = 1,
    db: Session = Depends(get_db)
):
    try:
        cache_key = f"batting_{start}_{end}_{min_pa}"
        
        # Check cache
        cached = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start,
            CachedStats.expires_at > datetime.utcnow()
        ).first()
        
        if cached:
            print(f"✅ CACHE HIT: {cache_key}")
            return cached.data
        
        print(f"❌ CACHE MISS: {cache_key} - Fetching from FanGraphs...")
        
        # Fetch from FanGraphs
        df = batting_stats(start, end, qual=min_pa)
        data = clean_records(df)
        
        # Save to cache (expires in 24 hours)
        new_cache = CachedStats(
            stat_type=cache_key,
            season=start,
            data=data,
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        db.add(new_cache)
        db.commit()
        
        print(f"💾 CACHED: {cache_key}")
        return data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        

@router.get('/player/roster')
def get_roster(
    start: int = Query(..., description="Start season (e.g. 2024)"), 
    end: int = Query(None, description="End season (optional, defaults to start)"),
    min_pa: int = Query(1, description="Minimum plate appearances")
): 
    try:
        season = start
        df = batting_stats_bref(season)
        if min_pa > 1:
            df = df[df['PA'] >= min_pa]
    except Exception as e: 
        raise HTTPException(status_code=502, detail=f"Failed to fetch batting data: {e}")
    if df is None or df.empty: 
        return []
    
    positions = get_all_positions(start)
    df = df.copy()
    df["Position"] = df["Name"].map(lambda n: positions.get(normalize_name(n)))
    return clean_records(df)

@router.get("/player/{player_name}/ids")
def get_player_ids(player_name: str):
    """Get Baseball Reference and MLB IDs for a specific player"""
    try:
        # Remove suffixes (Jr., Sr., II, III, IV)
        clean_name = player_name
        for suffix in [' Jr.', ' Sr.', ' II', ' III', ' IV', ' Jr', ' Sr']:
            clean_name = clean_name.replace(suffix, '')
        
        # Split name
        name_parts = clean_name.strip().split(' ', 1)
        first = name_parts[0] if len(name_parts) > 0 else ''
        last = name_parts[1] if len(name_parts) > 1 else name_parts[0]
        
        # Look up IDs
        lookup = playerid_lookup(last, first)
        
        if lookup.empty:
            raise HTTPException(status_code=404, detail=f"Player not found: {player_name}")
        
        player = lookup.iloc[0]
        
        # Convert numpy types to Python types
        return {
            'key_mlbam': int(player['key_mlbam']) if pd.notna(player['key_mlbam']) else None,
            'key_bbref': str(player['key_bbref']) if pd.notna(player['key_bbref']) else None,
            'key_fangraphs': str(player['key_fangraphs']) if pd.notna(player['key_fangraphs']) else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))