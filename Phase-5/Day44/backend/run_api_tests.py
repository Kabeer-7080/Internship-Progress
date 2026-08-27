import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:5000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    encoded_data = None
    if data is not None:
        if isinstance(data, dict):
            encoded_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            encoded_data = data
        elif isinstance(data, str):
            encoded_data = data.encode("utf-8")

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = resp.read().decode("utf-8")
            try:
                json_body = json.loads(body)
            except Exception:
                json_body = body
            return status, json_body
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode("utf-8")
        try:
            json_body = json.loads(body)
        except Exception:
            json_body = body
        return status, json_body
    except Exception as e:
        return None, str(e)

def run_all_tests():
    print("=" * 60)
    print("RUNNING DAY 45 API TESTS AGAINST FLASK SERVER")
    print("=" * 60)

    import time
    timestamp = int(time.time())
    valid_test_email = f"postman_test_{timestamp}@example.com"

    test_cases = [
        {
            "name": "1. Get Students",
            "method": "GET",
            "url": f"{BASE_URL}/api/students",
            "data": None,
            "expected_code": 200
        },
        {
            "name": "2. Create Student - Valid",
            "method": "POST",
            "url": f"{BASE_URL}/api/students",
            "data": {"name": "Neha Gupta", "email": valid_test_email, "course": "Cyber Security"},
            "expected_code": 201
        },
        {
            "name": "3. Empty Name",
            "method": "POST",
            "url": f"{BASE_URL}/api/students",
            "data": {"name": "", "email": "test_empty_name@example.com", "course": "IT"},
            "expected_code": 400
        },
        {
            "name": "4. Missing Email",
            "method": "POST",
            "url": f"{BASE_URL}/api/students",
            "data": {"name": "Test Student", "course": "IT"},
            "expected_code": 400
        },
        {
            "name": "5. Missing Course",
            "method": "POST",
            "url": f"{BASE_URL}/api/students",
            "data": {"name": "Test Student", "email": "test_missing_course@example.com"},
            "expected_code": 400
        },
        {
            "name": "6. Empty JSON",
            "method": "POST",
            "url": f"{BASE_URL}/api/students",
            "data": {},
            "expected_code": 400
        },
        {
            "name": "7. No Request Body",
            "method": "POST",
            "url": f"{BASE_URL}/api/students",
            "data": b"",
            "expected_code": 400
        },
        {
            "name": "8. Duplicate Email",
            "method": "POST",
            "url": f"{BASE_URL}/api/students",
            "data": {"name": "Duplicate User", "email": "arun@example.com", "course": "IT"},
            "expected_code": 409
        },
        {
            "name": "9. Invalid Endpoint",
            "method": "GET",
            "url": f"{BASE_URL}/api/student",
            "data": None,
            "expected_code": 404
        },
        {
            "name": "10. Unsupported HTTP Method",
            "method": "DELETE",
            "url": f"{BASE_URL}/api/students",
            "data": None,
            "expected_code": 405
        }
    ]

    results = []
    all_passed = True

    for tc in test_cases:
        status, response = make_request(tc["url"], method=tc["method"], data=tc["data"])
        passed = (status == tc["expected_code"])
        if not passed:
            all_passed = False

        status_str = "PASSED" if passed else "FAILED"
        print(f"[{status_str}] {tc['name']}")
        print(f"   Method: {tc['method']} | Endpoint: {tc['url']}")
        print(f"   Expected: {tc['expected_code']} | Actual: {status}")
        print(f"   Response: {json.dumps(response) if isinstance(response, dict) else response}\n")

        results.append({
            "name": tc["name"],
            "method": tc["method"],
            "url": tc["url"],
            "expected_code": tc["expected_code"],
            "actual_code": status,
            "response": response,
            "passed": passed
        })

    print("=" * 60)
    print(f"SUMMARY: {'ALL 10 TESTS PASSED!' if all_passed else 'SOME TESTS FAILED'}")
    print("=" * 60)
    return results, all_passed

if __name__ == "__main__":
    run_all_tests()
