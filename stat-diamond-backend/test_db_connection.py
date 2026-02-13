from app.database import engine 

try: 
   connection = engine.connect()
   print("Database Connection Successful")
   print(f"Connected to: {engine.url}")
   connection.close()
except Exception as e: 
   print(f"Database connection failed: {e}")
