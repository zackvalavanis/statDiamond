from fastapi import FastAPI 
from pybaseball import statcast
import pandas as pd

app = FastAPI()

@app.get('/')
def root(): 
  return { "status": "Backend Running"}

@app.get('/statcast')
def get_statcast_data(): 
  data = statcast(start_dt="2019-06-24",end_dt="2019-06-25")
  data = data.replace({pd.NA: None})
  data = data.where(pd.notnull(data), None)
  data = data.replace([float('inf'), float('-inf')], None)

  return data.to_dict(orient='records')