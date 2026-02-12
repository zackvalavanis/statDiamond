from fastapi import APIRouter, Query
from pybaseball import statcast, statcast_pitcher
import numpy as np
import pandas as pd

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get('/statcast')
def get_statcast_data(): 
    data = statcast(start_dt="2025-06-24", end_dt="2025-06-25")
    data = data.replace({pd.NA: None})
    data = data.where(pd.notnull(data), None)
    data = data.replace([float('inf'), float('-inf')], None)
    return data.head(10).to_dict(orient='records')

@router.get('/player')
def player_stats(player_id: int = Query(...), start: str = Query(...), end: str = Query(...)): 
    # Fetch pitching data
    df = statcast_pitcher(start_dt=start, end_dt=end, player_id=player_id)
    if df is None or df.empty:
        return []

    # Clean up NaNs and infinities
    df = df.applymap(lambda x: None if x is None or (isinstance(x, float) and (np.isnan(x) or np.isinf(x))) else x)
    
    return df.to_dict(orient='records')