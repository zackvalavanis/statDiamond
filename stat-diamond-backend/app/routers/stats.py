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
        cache_key = f"batting_mlb_v1_{start}_{end}_{min_pa}"
        
        # Check cache
        cached = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start,
            CachedStats.expires_at > datetime.utcnow()
        ).first()
        
        if cached:
            print(f"✅ CACHE HIT: {cache_key}")
            return cached.data
        
        print(f"❌ CACHE MISS: Fetching from MLB Stats API...")
        
        # Use MLB Stats API instead
        url = f"https://statsapi.mlb.com/api/v1/stats?stats=season&season={start}&group=hitting&sportId=1"
        res = requests.get(url)
        mlb_data = res.json()
        
        players = []
        for split in mlb_data.get('stats', []):
            for player_stat in split.get('splits', []):
                player = player_stat['player']
                stats = player_stat['stat']
                
                # Apply PA qualifier
                if stats.get('plateAppearances', 0) < min_pa:
                    continue
                
                players.append({
                    'IDfg': None,  # You'll need to map this
                    'key_mlbam': player['id'],
                    'Name': player['fullName'],
                    'Position': player.get('primaryPosition', {}).get('abbreviation'),
                    'Team': player_stat.get('team', {}).get('abbreviation'),
                    'G': stats.get('gamesPlayed'),
                    'PA': stats.get('plateAppearances'),
                    'HR': stats.get('homeRuns'),
                    'R': stats.get('runs'),
                    'RBI': stats.get('rbi'),
                    'SB': stats.get('stolenBases'),
                    'AVG': float(stats.get('avg', 0)),
                    'OBP': float(stats.get('obp', 0)),
                    'SLG': float(stats.get('slg', 0)),
                    'OPS': float(stats.get('ops', 0)),
                })
        
        # Cache with smart duration
        current_year = datetime.utcnow().year
        if start < current_year:
            cache_duration = timedelta(days=30)
        elif start == current_year:
            cache_duration = timedelta(minutes=30)  # Shorter for live season
        else:
            cache_duration = timedelta(days=7)
        
        expires_at = datetime.utcnow() + cache_duration
        
        # Upsert to cache
        existing = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start
        ).first()
        
        if existing:
            existing.data = players
            existing.cached_at = datetime.utcnow()
            existing.expires_at = expires_at
        else:
            new_cache = CachedStats(
                stat_type=cache_key,
                season=start,
                data=players,
                expires_at=expires_at
            )
            db.add(new_cache)
        
        db.commit()
        print(f"💾 CACHED: {cache_key} ({len(players)} players)")
        return players
        
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {str(e)}")
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
        cache_key = f"pitching_v4_{start}_{end}_{min_ip}"
        
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

        current_year = datetime.utcnow().year

        if start < current_year: 
            cache_duration = timedelta(days=30)
        elif start == current_year: 
            if min_ip < 50: 
                cache_duration = timedelta(minutes=30)
            else: 
                cache_duration = timedelta(hours=1)
        else: 
            cache_duration = timedelta(days=7)

        expires_at = datetime.utcnow() + cache_duration
        

        # Upsert to cache
        existing = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start
        ).first()
        
        if existing:
            existing.data = data
            existing.cached_at = datetime.utcnow()
            existing.expires_at = expires_at
        else:
            new_cache = CachedStats(
                stat_type=cache_key,
                season=start,
                data=data,
                expires_at=expires_at
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

@router.get("/player/batting-complete")
def get_batting_stats_complete(
    start: int,
    min_pa: int = 0,
    db: Session = Depends(get_db)
):
    """Get comprehensive batting stats by fetching all team rosters (includes everyone)"""
    try:
        cache_key = f"batting_complete_{start}_{min_pa}"
        
        # Check cache
        cached = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start,
            CachedStats.expires_at > datetime.utcnow()
        ).first()
        
        if cached:
            print(f"✅ CACHE HIT: {cache_key}")
            return cached.data
        
        print(f"🔄 Fetching complete roster stats from MLB Stats API...")
        
        all_players = []
        
        # Iterate through all 30 teams
        for team_name, team_id in MLB_TEAM_IDS.items():
            try:
                # Get active roster with stats
                url = f"https://statsapi.mlb.com/api/v1/teams/{team_id}/roster/Active?season={start}&hydrate=person(stats(type=season,season={start},group=hitting))"
                res = requests.get(url)
                data = res.json()
                
                roster = data.get('roster', [])
                
                for player_entry in roster:
                    player_info = player_entry.get('person', {})
                    player_id = player_info.get('id')
                    
                    # Get stats from hydrated data
                    stats_list = player_info.get('stats', [])
                    
                    if not stats_list:
                        continue
                    
                    # Get the season stats (first entry should be hitting stats)
                    season_stats = None
                    for stat_group in stats_list:
                        if stat_group.get('group', {}).get('displayName') == 'hitting':
                            splits = stat_group.get('splits', [])
                            if splits:
                                season_stats = splits[0].get('stat', {})
                                break
                    
                    if not season_stats:
                        continue
                    
                    # Apply PA filter
                    pa = season_stats.get('plateAppearances', 0)
                    if pa < min_pa:
                        continue
                    
                    # Get position
                    position = player_entry.get('position', {}).get('abbreviation', 'N/A')
                    
                    # Build player record
                    player_record = {
                        'key_mlbam': player_id,
                        'Name': player_info.get('fullName'),
                        'Team': team_name,
                        'Position': position,
                        
                        # Counting stats
                        'G': season_stats.get('gamesPlayed', 0),
                        'PA': pa,
                        'AB': season_stats.get('atBats', 0),
                        'R': season_stats.get('runs', 0),
                        'H': season_stats.get('hits', 0),
                        'HR': season_stats.get('homeRuns', 0),
                        'RBI': season_stats.get('rbi', 0),
                        'SB': season_stats.get('stolenBases', 0),
                        'BB': season_stats.get('baseOnBalls', 0),
                        'SO': season_stats.get('strikeOuts', 0),
                        '2B': season_stats.get('doubles', 0),
                        '3B': season_stats.get('triples', 0),
                        
                        # Rate stats
                        'AVG': float(season_stats.get('avg', '0') or 0),
                        'OBP': float(season_stats.get('obp', '0') or 0),
                        'SLG': float(season_stats.get('slg', '0') or 0),
                        'OPS': float(season_stats.get('ops', '0') or 0),
                    }
                    
                    all_players.append(player_record)
                    
            except Exception as e:
                print(f"⚠️ Error fetching {team_name} roster: {e}")
                continue
        
        print(f"📊 Fetched {len(all_players)} players total")
        
        # Cache with smart duration
        current_year = datetime.utcnow().year
        
        if start < current_year:
            cache_duration = timedelta(days=30)
        elif start == current_year:
            cache_duration = timedelta(minutes=15)  # Live season - 15 min cache
        else:
            cache_duration = timedelta(days=7)
        
        expires_at = datetime.utcnow() + cache_duration
        
        # Store in cache
        existing = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start
        ).first()
        
        if existing:
            existing.data = all_players
            existing.cached_at = datetime.utcnow()
            existing.expires_at = expires_at
        else:
            new_cache = CachedStats(
                stat_type=cache_key,
                season=start,
                data=all_players,
                expires_at=expires_at
            )
            db.add(new_cache)
        
        db.commit()
        print(f"💾 CACHED {len(all_players)} players (expires in {cache_duration})")
        return all_players
        
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

######### Pitching Stats

@router.get("/player/pitching-complete")
def get_pitching_stats_complete(
    start: int,
    min_ip: int = 10,
    db: Session = Depends(get_db)
):
    """Get comprehensive pitching stats by fetching all team rosters (includes everyone)"""
    try:
        cache_key = f"pitching_complete_{start}_{min_ip}"
        
        # Check cache
        cached = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start,
            CachedStats.expires_at > datetime.utcnow()
        ).first()
        
        if cached:
            print(f"✅ CACHE HIT: {cache_key}")
            return cached.data
        
        print(f"🔄 Fetching complete roster stats from MLB Stats API...")
        
        all_players = []
        
        # Iterate through all 30 teams
        for team_name, team_id in MLB_TEAM_IDS.items():
            try:
                # Get active roster with stats
                url = f"https://statsapi.mlb.com/api/v1/teams/{team_id}/roster/Active?season={start}&hydrate=person(stats(type=season,season={start},group=pitching))"
                res = requests.get(url)
                data = res.json()
                
                roster = data.get('roster', [])
                
                for player_entry in roster:
                    player_info = player_entry.get('person', {})
                    player_id = player_info.get('id')
                    
                    # Get stats from hydrated data
                    stats_list = player_info.get('stats', [])
                    
                    if not stats_list:
                        continue
                    
                    # Get the season stats (first entry should be hitting stats)
                    season_stats = None
                    for stat_group in stats_list:
                        if stat_group.get('group', {}).get('displayName') == 'pitching':
                            splits = stat_group.get('splits', [])
                            if splits:
                                season_stats = splits[0].get('stat', {})
                                break
                    
                    if not season_stats:
                        continue
                    
                    # Apply PA filter
                    ip = float(season_stats.get('inningsPitched', '0') or 0)
                    if ip < min_ip:
                        continue
                    
                    # Get position
                    position = player_entry.get('position', {}).get('abbreviation', 'N/A')
                    
                    # Build player record
                    player_record = {
                        'key_mlbam': player_id,
                        'Name': player_info.get('fullName'),
                        'Team': team_name,
                        'Position': position,
                        
                        # Counting stats
                        'G': season_stats.get('gamesPlayed', 0),
                        'GS': season_stats.get('gamesStarted', 0),
                        'W': season_stats.get('wins', 0),
                        'L': season_stats.get('losses', 0),
                        'SV': season_stats.get('saves', 0),
                        'IP': ip,
                        'H': season_stats.get('hits', 0),
                        'R': season_stats.get('runs', 0),
                        'ER': season_stats.get('earnedRuns', 0),
                        'HR': season_stats.get('homeRuns', 0),
                        'BB': season_stats.get('baseOnBalls', 0),
                        'SO': season_stats.get('strikeOuts', 0),
                        
                        # Rate stats
                        'ERA': float(season_stats.get('era', '0') or 0),
                        'WHIP': float(season_stats.get('whip', '0') or 0),
                        'K/9': float(season_stats.get('strikeoutsPer9Inn', '0') or 0),
                        'BB/9': float(season_stats.get('walksPer9Inn', '0') or 0),
                        'AVG': float(season_stats.get('avg', '0') or 0),  # Opponent batting average
                    }
                    
                    all_players.append(player_record)
                    
            except Exception as e:
                print(f"⚠️ Error fetching {team_name} roster: {e}")
                continue
        
        print(f"📊 Fetched {len(all_players)} pitchers total")
        
        # Cache with smart duration
        current_year = datetime.utcnow().year
        
        if start < current_year:
            cache_duration = timedelta(days=30)
        elif start == current_year:
            cache_duration = timedelta(minutes=15)  # Live season - 15 min cache
        else:
            cache_duration = timedelta(days=7)
        
        expires_at = datetime.utcnow() + cache_duration
        
        # Store in cache
        existing = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == start
        ).first()
        
        if existing:
            existing.data = all_players
            existing.cached_at = datetime.utcnow()
            existing.expires_at = expires_at
        else:
            new_cache = CachedStats(
                stat_type=cache_key,
                season=start,
                data=all_players,
                expires_at=expires_at
            )
            db.add(new_cache)
        
        db.commit()
        print(f"💾 CACHED {len(all_players)} players (expires in {cache_duration})")
        return all_players
        
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
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

