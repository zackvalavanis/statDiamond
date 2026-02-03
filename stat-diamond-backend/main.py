from fastapi import FastAPI, Query
from pybaseball import statcast
from pybaseball import  playerid_lookup
from pybaseball import  statcast_pitcher
import numpy as np
import pandas as pd

app = FastAPI()

@app.get('/')
def root(): 
  return { "status": "Backend Running"}

@app.get('/statcast')
def get_statcast_data(): 
  data = statcast(start_dt="2025-06-24",end_dt="2025-06-25")
  data = data.replace({pd.NA: None})
  data = data.where(pd.notnull(data), None)
  data = data.replace([float('inf'), float('-inf')], None)

  return data.head(10).to_dict(orient='records')

@app.get('/player')
def lookup_player(first: str = Query(...), last: str = Query(...)): 
  lookup_value = playerid_lookup(last, first)
  lookup_value = lookup_value.replace({pd.NA: None})
  lookup_value = lookup_value.where(pd.notnull(lookup_value), None)
  return lookup_value.to_dict(orient='records')

@app.get('/player/stats')
def player_state(player_id: int = Query(...), start: str = Query(...), end: str = Query(...)): 
    player = playerid_lookup(last, first)
    if player.empty:
        return {"error": "Player not found"}

    player_id = int(player["key_mlbam"].iloc[0])
    
    # Fetch pitching data
    df = statcast_pitcher(start_dt=start, end_dt=end, player_id=player_id)
    if df is None or df.empty:
        return []

    # Clean up NaNs and infinities
    df = df.applymap(lambda x: None if x is None or (isinstance(x, float) and (np.isnan(x) or np.isinf(x))) else x)
    
    return df.to_dict(orient='records')

