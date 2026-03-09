from fastapi import APIRouter, Query, HTTPException
from pybaseball import standings
import pandas as pd
import numpy as np
import math
from pybaseball import cache

cache.enable()

DIVISION_LABELS = [
    {"league": "American League", "division": "AL East"},
    {"league": "American League", "division": "AL Central"},
    {"league": "American League", "division": "AL West"},
    {"league": "National League", "division": "NL East"},
    {"league": "National League", "division": "NL Central"},
    {"league": "National League", "division": "NL West"},
]


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

router = APIRouter(prefix="/api", tags=["standings"])

@router.get('/standings')
def get_standings(season: int):
    """Fetch standings data grouped by division."""
    try:
        tables = standings(season)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch standings: {e}")

    if not tables:
        return []

    all_rows = []
    for i, table in enumerate(tables):
        label = DIVISION_LABELS[i] if i < len(DIVISION_LABELS) else {"league": "Unknown", "division": "Unknown"}
        table = table.copy()
        table["league"] = label["league"]
        table["division"] = label["division"]
        all_rows.append(table)

    all_standings = pd.concat(all_rows, ignore_index=True)
    return clean_records(all_standings)