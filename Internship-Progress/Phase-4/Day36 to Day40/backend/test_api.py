import sys
import os
from fastapi.testclient import TestClient  # type: ignore # pyrefly: ignore

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("   FINGUARD MYSQL REST API & CRUD TEST SUITE      ")
    print("==================================================")

    # 1. Health Check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] GET /health ->", res.json())

    from uuid import uuid4
    # 2. Auth: Register
    reg_email = f"test.user.{str(uuid4())[:8]}@finguard.io"
    reg_payload = {
        "name": "Test User",
        "email": reg_email,
        "password": "securepassword",
        "role": "Analyst"
    }
    res = client.post("/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] POST /auth/register -> Created user {reg_email}")

    # 3. Auth: Login
    res = client.post("/auth/login", json={"email": reg_email, "password": "securepassword"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] POST /auth/login -> Authenticated successfully")

    # 3b. Auth: Protected Route /auth/me
    res = client.get("/auth/me", headers=headers)
    assert res.status_code == 200, f"GET /auth/me failed: {res.text}"
    assert res.json()["email"] == reg_email
    print(f"[PASS] GET /auth/me -> Retrieved authenticated user profile")

    # 3c. Auth: Incorrect Login Attempt
    bad_res = client.post("/auth/login", json={"email": reg_email, "password": "wrongpassword"})
    assert bad_res.status_code == 401
    print(f"[PASS] POST /auth/login (Invalid Password) -> Rejected with 401 Unauthorized")

    # 4. Assessment CRUD
    # CREATE Assessment
    new_assessment = {
        "name": "Jordan Vance",
        "type": "loan",
        "income": 9200,
        "amount": 25000,
        "credit_score": 750,
        "employment": "Full time",
        "term_months": 36,
        "channel": "Branch"
    }
    res = client.post("/assessments", json=new_assessment, headers=headers)
    assert res.status_code == 201, f"Create assessment failed: {res.text}"
    created_item = res.json()
    item_id = created_item["id"]
    print(f"[PASS] POST /assessments (CREATE) -> ID: {item_id}, Verdict: {created_item['verdict']}, Score: {created_item['score']}")

    # READ ALL Assessments
    res = client.get("/assessments", headers=headers)
    assert res.status_code == 200, f"List assessments failed: {res.text}"
    items = res.json()
    print(f"[PASS] GET /assessments (READ ALL) -> Retrieved {len(items)} records from MySQL")

    # READ ONE Assessment
    res = client.get(f"/assessments/{item_id}", headers=headers)
    assert res.status_code == 200, f"Get assessment failed: {res.text}"
    print(f"[PASS] GET /assessments/{item_id} (READ ONE) -> Subject: {res.json()['name']}")

    # UPDATE Assessment
    update_payload = {
        "income": 2500,
        "credit_score": 540,
        "amount": 80000
    }
    res = client.put(f"/assessments/{item_id}", json=update_payload, headers=headers)
    assert res.status_code == 200, f"Update assessment failed: {res.text}"
    updated_item = res.json()
    print(f"[PASS] PUT /assessments/{item_id} (UPDATE) -> Rescored -> Score: {updated_item['score']}, Verdict: {updated_item['verdict']}")

    # DELETE Assessment
    res = client.delete(f"/assessments/{item_id}", headers=headers)
    assert res.status_code == 200, f"Delete assessment failed: {res.text}"
    print(f"[PASS] DELETE /assessments/{item_id} (DELETE) -> Removed from MySQL DB")

    # 5. Team CRUD
    # CREATE Team Member
    new_member = {
        "name": "Sophia Zhang",
        "email": f"sophia.{str(uuid4())[:8]}@finguard.io",
        "role": "Analyst",
        "status": "Invited"
    }
    res = client.post("/team", json=new_member, headers=headers)
    assert res.status_code == 201, f"Create team member failed: {res.text}"
    member_id = res.json()["id"]
    print(f"[PASS] POST /team (CREATE) -> Member ID: {member_id}")

    # READ Team
    res = client.get("/team", headers=headers)
    assert res.status_code == 200
    print(f"[PASS] GET /team (READ ALL) -> {len(res.json())} team members retrieved")

    # DELETE Team Member
    res = client.delete(f"/team/{member_id}", headers=headers)
    assert res.status_code == 200
    print(f"[PASS] DELETE /team/{member_id} (DELETE) -> Member removed")

    # 6. Auth: Logout & Token Revocation
    res = client.post("/auth/logout", headers=headers)
    assert res.status_code == 200
    print(f"[PASS] POST /auth/logout -> Logged out successfully")

    # 7. Auth: Protected Route After Logout (Must return 401)
    res = client.get("/auth/me", headers=headers)
    assert res.status_code == 401
    print(f"[PASS] GET /auth/me (Post Logout) -> Correctly blocked with 401 Unauthorized")

    print("==================================================")
    print("   ALL MYSQL REST API & CRUD TESTS PASSED!        ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
