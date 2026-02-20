from .player import router as player_router
from .stats import router as stats_router
from app.routers import auth

__all__ = ["player_router", 'stats_router', "auth"]

