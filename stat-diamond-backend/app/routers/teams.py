from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import requests

from app.dependencies import get_db
from app.models.cached_stats import CachedStats

router = APIRouter(prefix="/api/teams", tags=["teams"])

# -------------------------
# MAPS
# -------------------------

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

MLB_TEAM_ABBR = {
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

# -------------------------
# HELPERS
# -------------------------

def resolve_team(team_id: str):
    """Resolve team name, abbr, and MLB ID from various inputs"""
    if not team_id:
        return None, None, None

    # If numeric ID
    if team_id.isdigit():
        for name, mlb_id in MLB_TEAM_IDS.items():
            if mlb_id == int(team_id):
                return name, MLB_TEAM_ABBR[name], mlb_id

    # If abbreviation
    for name, abbr in MLB_TEAM_ABBR.items():
        if team_id.upper() == abbr:
            return name, abbr, MLB_TEAM_IDS[name]

    # If full name
    if team_id in MLB_TEAM_IDS:
        return team_id, MLB_TEAM_ABBR[team_id], MLB_TEAM_IDS[team_id]

    return None, None, None


# -------------------------
# ROSTER WITH MLB STATS API
# -------------------------

@router.get("/{team_id}/roster")
def roster(team_id: str, season: int = 2026, db: Session = Depends(get_db)):
    """Get team roster with live stats from MLB Stats API"""
    
    team_name, team_abbr, mlb_id = resolve_team(team_id)

    if not team_name:
        raise HTTPException(status_code=404, detail="Unknown team")

    cache_key = f"roster_{team_abbr}_{season}"
    
    # Check cache
    cached = db.query(CachedStats).filter(
        CachedStats.stat_type == cache_key,
        CachedStats.season == season,
        CachedStats.expires_at > datetime.utcnow()
    ).first()
    
    if cached:
        print(f"✅ CACHE HIT: {cache_key}")
        return cached.data

    print(f"🔄 Fetching roster for {team_name}...")

    try:
        # Get roster with stats from MLB Stats API
        url = f"https://statsapi.mlb.com/api/v1/teams/{mlb_id}/roster/Active?season={season}&hydrate=person(stats(type=season,season={season}))"
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        data = res.json()

        if "roster" not in data:
            raise HTTPException(status_code=502, detail="MLB API failed")

        roster_list = []

        for player_entry in data["roster"]:
            person = player_entry.get("person", {})
            pos = player_entry.get("position", {}).get("abbreviation", "DH")
            is_pitcher = pos == "P"

            # Get stats from hydrated data
            stats_list = person.get("stats", [])
            batting_stats = None
            pitching_stats = None

            for stat_group in stats_list:
                group_name = stat_group.get("group", {}).get("displayName")
                splits = stat_group.get("splits", [])
                
                if splits:
                    season_stat = splits[0].get("stat", {})
                    
                    if group_name == "hitting":
                        batting_stats = season_stat
                    elif group_name == "pitching":
                        pitching_stats = season_stat

            # Build player record
            player_record = {
                "IDfg": person.get("id"),
                "key_mlbam": person.get("id"),
                "Name": person.get("fullName"),
                "Position": pos,
                "player_type": "pitcher" if is_pitcher else "hitter",
            }

            # Add batting stats
            if batting_stats:
                player_record.update({
                    "AB": batting_stats.get("atBats", 0),
                    "H": batting_stats.get("hits", 0),
                    "HR": batting_stats.get("homeRuns", 0),
                    "RBI": batting_stats.get("rbi", 0),
                    "AVG": float(batting_stats.get("avg", "0") or 0),
                    "OBP": float(batting_stats.get("obp", "0") or 0),
                    "SLG": float(batting_stats.get("slg", "0") or 0),
                })
            else:
                player_record.update({
                    "AB": 0, "H": 0, "HR": 0, "RBI": 0,
                    "AVG": 0.0, "OBP": 0.0, "SLG": 0.0,
                })

            # Add pitching stats
            if pitching_stats:
                player_record.update({
                    "IP": float(pitching_stats.get("inningsPitched", "0") or 0),
                    "ERA": float(pitching_stats.get("era", "0") or 0),
                    "SO": pitching_stats.get("strikeOuts", 0),
                    "BB": pitching_stats.get("baseOnBalls", 0),
                    "W": pitching_stats.get("wins", 0),
                    "L": pitching_stats.get("losses", 0),
                    "WHIP": float(pitching_stats.get("whip", "0") or 0),
                })
            else:
                player_record.update({
                    "IP": 0.0, "ERA": 0.0, "SO": 0, "BB": 0,
                    "W": 0, "L": 0, "WHIP": 0.0,
                })

            # WAR placeholder (MLB API doesn't provide this)
            player_record["WAR"] = 0.0

            roster_list.append(player_record)

        # Cache for 15 minutes
        current_year = datetime.utcnow().year
        cache_duration = timedelta(minutes=15) if season == current_year else timedelta(days=7)
        expires_at = datetime.utcnow() + cache_duration

        # Store in cache
        existing = db.query(CachedStats).filter(
            CachedStats.stat_type == cache_key,
            CachedStats.season == season
        ).first()

        if existing:
            existing.data = roster_list
            existing.cached_at = datetime.utcnow()
            existing.expires_at = expires_at
        else:
            new_cache = CachedStats(
                stat_type=cache_key,
                season=season,
                data=roster_list,
                expires_at=expires_at
            )
            db.add(new_cache)

        db.commit()
        print(f"💾 CACHED {len(roster_list)} players")
        
        return roster_list

    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))