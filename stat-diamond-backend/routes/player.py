from fastapi import APIRouter, Query 
from pybaseball import playerid_lookup
import pandas as pd

router = APIRouter(prefix="/player", tags=["player"])

@router.get('/dummy')
def get_dummy_player(): 
  return {
    "id": 1, 
    "name": "Mike Trout", 
    'first_name': "Mike", 
    'last_name': 'Trout', 
    'position': 'CF', 
    'team': 'LAA', 
    'batting_avg': 0.283, 
    'home_runs': 40, 
    'rbi': 104,
    'ops': 0.988, 
    'stats_2024': { 
      'games': 119,
      'at_bats': 436, 
      'hits': 123,
      "doubles": 20,
      "triples": 1,
      "strikeouts": 103,
      "walks": 79
    }
  }


@router.get('/dummy/list')
def get_dummy_players_list():
    """Returns a list of dummy players"""
    return [
        {
            "id": 545361,
            "name": "Mike Trout",
            "team": "LAA",
            "position": "CF",
            "batting_avg": 0.283
        },
        {
            "id": 660271,
            "name": "Aaron Judge",
            "team": "NYY",
            "position": "RF",
            "batting_avg": 0.322
        },
        {
            "id": 660670,
            "name": "Ronald Acuña Jr.",
            "team": "ATL",
            "position": "OF",
            "batting_avg": 0.337
        }
    ]
    
@router.get('')
def lookup_player(first: str = Query(...), last: str = Query(...)): 
    lookup_value = playerid_lookup(last, first)
    lookup_value = lookup_value.replace({pd.NA: None})
    lookup_value = lookup_value.where(pd.notnull(lookup_value), None)
    return lookup_value.to_dict(orient='records')
