import os
import sys
import uvicorn

# Ensure backend directory is in python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.append(backend_dir)

from backend.init_db import init_db

if __name__ == "__main__":
    print("==================================================")
    print("   FINGUARD - MYSQL & API REST BACKEND SERVER     ")
    print("==================================================")
    
    # 1. Initialize DB tables & seed data
    try:
        init_db()
    except Exception as e:
        print(f"Notice: Database initialization notice ({e})")
    
    # 2. Launch FastAPI Uvicorn Server
    print("\nStarting REST API Server on http://localhost:8000 ...")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
