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
from datetime import datetime
from pytz import timezone 

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


@router.get("/player/batting")
def get_batting_stats(
    start: int, 
    end: int, 
    min_pa: int = 1,
    db: Session = Depends(get_db)
):
    try:
        cache_key = f"batting_v2_{start}_{end}_{min_pa}"
        
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
        
        # Add MLB IDs and Positions
        fg_to_mlb = get_id_mapping()
        positions = get_all_positions(start)
        
        df = df.copy()
        df["key_mlbam"] = df["IDfg"].map(fg_to_mlb)
        df["Position"] = df["Name"].map(lambda n: positions.get(normalize_name(n)))
        
        data = clean_records(df)
        
        # Upsert to cache
        existing = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start
        ).first()
        
        if existing:
            existing.data = data
            existing.cached_at = datetime.utcnow()
            existing.expires_at = datetime.utcnow() + timedelta(hours=24)
        else:
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
        db.rollback()
        print(f"❌ ERROR in get_batting_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/player/pitching')
def get_pitching_stats(
    start: int = Query(..., description="Start season (e.g. 2024)"),
    end: int = Query(..., description="End season (e.g. 2025)"),
    min_ip: int = Query(1, description="Minimum innings pitched qualifier"),
    db: Session = Depends(get_db)
):
    try:
        cache_key = f"pitching_v2_{start}_{end}_{min_ip}"
        
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
        df = pitching_stats(start, end, qual=min_ip)
        
        # Add MLB IDs and Positions
        fg_to_mlb = get_id_mapping()
        positions = get_all_positions(start)
        
        df = df.copy()
        df["key_mlbam"] = df["IDfg"].map(fg_to_mlb)
        df["Position"] = df["Name"].map(lambda n: positions.get(normalize_name(n)))
        
        data = clean_records(df)
        
        # Upsert to cache
        existing = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start
        ).first()
        
        if existing:
            existing.data = data
            existing.cached_at = datetime.utcnow()
            existing.expires_at = datetime.utcnow() + timedelta(hours=24)
        else:
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
        db.rollback()
        print(f"❌ ERROR in get_pitching_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


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

@router.get("/live-games")
def get_live_games(date: str = None):
    """Get today's live game scores from MLB Stats API"""
    try:
        if date: 
            selected_date = date
        else: 
            eastern = timezone('America/New_York')
            selected_date = datetime.now(eastern).strftime('%Y-%m-%d')
        url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={selected_date}&hydrate=linescore,team"
        res = requests.get(url)
        data = res.json()
        
        games = []
        for date in data.get('dates', []):
            for game in date.get('games', []):
                games.append({
                    'game_id': game['gamePk'],
                    'status': game['status']['detailedState'],
                    'status_code': game['status']['statusCode'], 
                    
                    # Teams
                    'away_team': game['teams']['away']['team']['name'],
                    'away_score': game['teams']['away'].get('score', 0),
                    'away_record': f"{game['teams']['away'].get('leagueRecord', {}).get('wins', 0)}-{game['teams']['away'].get('leagueRecord', {}).get('losses', 0)}",

                    'home_team': game['teams']['home']['team']['name'],
                    'home_score': game['teams']['home'].get('score', 0),
                    'home_record': f"{game['teams']['home'].get('leagueRecord', {}).get('wins', 0)}-{game['teams']['home'].get('leagueRecord', {}).get('losses', 0)}",
        
                    # Game state
                    'inning': game.get('linescore', {}).get('currentInning'),
                    'inning_state': game.get('linescore', {}).get('inningState'),
                    'is_top_inning': game.get('linescore', {}).get('isTopInning'),

                    # Time
                    'game_time': game.get('gameDate'),
                    'scheduled_innings': game.get('scheduledInnings', 9),

                    # Venue
                    'venue': game.get('venue', {}).get('name'),

                    # Live count
                    'balls': game.get('linescore', {}).get('balls'),
                    'strikes': game.get('linescore', {}).get('strikes'),
                    'outs': game.get('linescore', {}).get('outs'),

                    # Type
                    'game_type': game.get('gameType'),
                })
        
        return games
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/live-games/{game_id}/boxscore")
def get_box_score(game_id: int): 
    try: 
        url = f"https://statsapi.mlb.com/api/v1/game/{game_id}/boxscore"
        res = requests.get(url)
        data = res.json()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/live-games/{game_id}/playbyplay")
def get_play_by_play(game_id: int):
    """Get pitch-by-pitch play-by-play for a game"""
    try:
        url = f"https://statsapi.mlb.com/api/v1/game/{game_id}/playByPlay"
        res = requests.get(url)
        data = res.json()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

