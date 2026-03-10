from fastapi.testclient import TestClient 
from app.main import app
from app.tests.conftest import client

def test_get_players():
  response = client.get('/api/favorites/players')
  assert response.status_code == 200


def test_post_favorites():
  response = client.post('/api/favorites/players', json={
    "player_id": "2",
    "player_name":"Bob Steve"
  })
  assert response.status_code == 201
  assert response.json()["player_name"] == 'Bob Steve'

