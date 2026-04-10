from pydantic_settings import BaseSettings

CORS_ORIGINS = [
    "http://localhost:5173",
    "https://stat-diamond.vercel.app",
    "https://stat-diamond-kvcyqrlow-zackvalavanis-projects.vercel.app",
]

class Settings(BaseSettings): 
  #Database 
  DATABASE_URL: str
  #JWT
  SECRET_KEY: str
  ALGORITHM: str
  ACCESS_TOKEN_EXPIRE_MINUTES: int

  class Config: 
    env_file = ".env"
    
settings = Settings()