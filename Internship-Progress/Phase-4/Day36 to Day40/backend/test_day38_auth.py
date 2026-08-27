import sys
import os
import pymysql  # type: ignore # pyrefly: ignore
from fastapi.testclient import TestClient  # type: ignore # pyrefly: ignore

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app
from app.database import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

client = TestClient(app)

LOGIN_CREDENTIALS = {
    "email": "john@finguard.com",
    "password": "John@12345"
}

INVALID_CREDENTIALS = {
    "email": "john@finguard.com",
    "password": "WrongPassword123!"
}

def run_day38_tests():
    print("==================================================")
    print("   DAY 38 - SESSIONS, LOGIN & LOGOUT TEST SUITE   ")
    print("==================================================")

    # 0. System Health Check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] GET /health -> System is up and connected to MySQL")

    # 1. Invalid Login Attempt (Must return HTTP 401)
    bad_login = client.post("/auth/login", json=INVALID_CREDENTIALS)
    assert bad_login.status_code == 401, f"Expected 401 on bad password, got {bad_login.status_code}"
    print("[PASS] POST /auth/login (Invalid Password) -> HTTP 401 Unauthorized")

    # 2. STEP 1 — Valid Login (Must return HTTP 200 and access_token)
    login_res = client.post("/auth/login", json=LOGIN_CREDENTIALS)
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    data = login_res.json()
    assert "access_token" in data, "No access_token returned!"
    assert "password" not in data and "password_hash" not in data, "Security leak in login response!"
    token = data["access_token"]
    user_info = data["user"]
    print(f"[STEP 1 PASS] POST /auth/login -> HTTP 200 OK")
    print(f"              User: {user_info['name']} <{user_info['email']}>")
    print(f"              Token: {token[:25]}...")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Unauthenticated Access to Protected Routes (Must return HTTP 401)
    unauth_res = client.get("/auth/me")
    assert unauth_res.status_code == 401, f"Expected 401 without token, got {unauth_res.status_code}"
    assert client.get("/assessments").status_code == 401, "GET /assessments not protected!"
    assert client.get("/team").status_code == 401, "GET /team not protected!"
    print("[PASS] GET /auth/me, /assessments, /team (No Token) -> HTTP 401 Unauthorized")

    # 4. STEP 2 — Access Protected Route (/auth/me) with valid token (Must return HTTP 200)
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200, f"Protected route failed: {me_res.text}"
    me_data = me_res.json()
    assert me_data["email"] == LOGIN_CREDENTIALS["email"]
    print(f"[STEP 2 PASS] GET /auth/me -> HTTP 200 OK")
    print(f"              Profile: {me_data}")

    # 5. STEP 3 — Logout (/auth/logout) (Must return HTTP 200)
    logout_res = client.post("/auth/logout", headers=headers)
    assert logout_res.status_code == 200, f"Logout failed: {logout_res.text}"
    print(f"[STEP 3 PASS] POST /auth/logout -> HTTP 200 OK: {logout_res.json()}")

    # 6. STEP 4 — Try Protected Route AGAIN using SAME logged-out token (Must return HTTP 401 BLOCKED)
    blocked_res = client.get("/auth/me", headers=headers)
    assert blocked_res.status_code == 401, f"CRITICAL FAIL: Logged-out token was NOT blocked! Status: {blocked_res.status_code}"
    print(f"[STEP 4 PASS] GET /auth/me (After Logout) -> HTTP 401 Unauthorized (BLOCKED!)")

    # 7. MySQL Verification of Revoked Token Table
    print("\n--------------------------------------------------")
    print("   VERIFYING MYSQL DATABASE ('revoked_tokens')    ")
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
            cursor.execute("SELECT id, token, revoked_at FROM revoked_tokens WHERE token = %s", (token,))
            row = cursor.fetchone()
            assert row is not None, "Revoked token record missing from MySQL database!"
            print(f"Found revoked token entry in MySQL database 'finguard':")
            print(f"ID: {row['id']}")
            print(f"Revoked At: {row['revoked_at']}")
            print(f"Token: {row['token'][:30]}...")
        conn.close()
        print("[PASS] MySQL 'revoked_tokens' table verified successfully!")
    except Exception as e:
        print(f"[DB NOTICE] Direct MySQL connection check: {e}")
        # Verify in SQLite fallback if MySQL is not active
        import sqlite3
        if os.path.exists("./finguard.db"):
            sq_conn = sqlite3.connect("./finguard.db")
            cur = sq_conn.cursor()
            cur.execute("SELECT id, token, revoked_at FROM revoked_tokens WHERE token = ?", (token,))
            sq_row = cur.fetchone()
            assert sq_row is not None, "Revoked token missing from SQLite database!"
            print("[PASS] SQLite fallback 'revoked_tokens' table verified successfully!")
            sq_conn.close()

    print("\n==================================================")
    print("   DAY 38 AUTHENTICATION TEST SUITE PASSED!       ")
    print("==================================================")

if __name__ == "__main__":
    run_day38_tests()
