from sqlalchemy import create_engine # connects to the database
from sqlalchemy.ext.declarative import declarative_base # creates the base class model for all models 
from sqlalchemy.orm import sessionmaker #factory for creating database sessions
from app.config import settings

engine = create_engine(settings.DATABASE_URL) # This creates a connection to the database


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
# Creates database sessions, which is opening a connection, doing some work and closing it.
# Autocommit false means that we control when to saved changes
# autoflush false means we control when to send data to the DB 
# bind = engine - ties to database connection 
# engine is like the wifi connection and session is like a browser tab 
Base = declarative_base()
# creates a base class that all models will inherit from 


def get_db(): 
  db=SessionLocal()
  try: 
    yield db
  finally: 
    db.close()

#Creates a new Db session
# yield gives it to whoever needs it 
# always close the connection when done
