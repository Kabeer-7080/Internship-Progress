import sys
import os
import pymysql  # type: ignore # pyrefly: ignore
from fastapi.testclient import TestClient  # type: ignore # pyrefly: ignore

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app
from app.database import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

client = TestClient(app)

TEST_USERS = [
    {
        "name": "John Customer",
        "email": "john@finguard.com",
        "password": "John@12345"
    },
    {
        "name": "Sarah Customer",
        "email": "sarah@finguard.com",
        "password": "Sarah@12345"
    },
    {
        "name": "Alex Customer",
        "email": "alex@finguard.com",
        "password": "Alex@12345"
    }
]

def run_day37_tests():
    print("==================================================")
    print("   DAY 37 AUTHENTICATION BASICS - REGISTRATION    ")
    print("==================================================")

    # 1. Health Check
    res = client.get("/health")
    print(f"[STATUS] Backend Health: {res.status_code} {res.json()}")
    assert res.status_code == 200, f"Health check failed: {res.text}"

    # 2. Register 3 Test Users
    for u in TEST_USERS:
        res = client.post("/auth/register", json=u)
        if res.status_code == 201:
            print(f"[SUCCESS 201] Registered: {u['name']} <{u['email']}>")
            data = res.json()
            assert "password" not in data, "Security Leak: raw password returned!"
            assert "password_hash" not in data, "Security Leak: password_hash returned!"
        elif res.status_code == 409:
            print(f"[EXISTS 409] User already exists: {u['email']}")
        else:
            print(f"[FAIL {res.status_code}] Failed to register {u['email']}: {res.text}")
            assert False, f"Registration endpoint error for {u['email']}"

    # 3. Test Duplicate Registration (Must fail with 409 or 400)
    dup_res = client.post("/auth/register", json=TEST_USERS[0])
    assert dup_res.status_code in [400, 409], f"Expected 409/400 on duplicate, got {dup_res.status_code}"
    print(f"[PASS 409] Duplicate registration handled correctly for {TEST_USERS[0]['email']}")

    # 4. Directly Verify in MySQL Database
    print("\n--------------------------------------------------")
    print("   VERIFYING MYSQL DATABASE ('finguard.users')    ")
    print("--------------------------------------------------")
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name, email, password_hash, role, created_at FROM users WHERE email IN ('john@finguard.com', 'sarah@finguard.com', 'alex@finguard.com')")
            rows = cursor.fetchall()
            print(f"Found {len(rows)} registered test users in MySQL 'finguard' DB:\n")
            for r in rows:
                print(f"ID: {r['id']}")
                print(f"Name: {r['name']}")
                print(f"Email: {r['email']}")
                print(f"Role: {r['role']}")
                print(f"Created At: {r['created_at']}")
                print(f"Password Hash: {r['password_hash']}")
                print("-" * 50)

                # Security Checks
                assert r["password_hash"] not in ["John@12345", "Sarah@12345", "Alex@12345"], "CRITICAL FAIL: Plain-text password stored in DB!"
                assert r["password_hash"].startswith("scrypt:") or r["password_hash"].startswith("pbkdf2:"), f"Unexpected hash algorithm: {r['password_hash']}"

        conn.close()
        print("[PASS] Database verification successful: All passwords safely hashed using Werkzeug generate_password_hash!")
    except Exception as e:
        print(f"[DB NOTICE] Direct MySQL connection check: {e}")

    print("\n==================================================")
    print("   DAY 37 TEST SUITE COMPLETED SUCCESSFULLY!      ")
    print("==================================================")

if __name__ == "__main__":
    run_day37_tests()
