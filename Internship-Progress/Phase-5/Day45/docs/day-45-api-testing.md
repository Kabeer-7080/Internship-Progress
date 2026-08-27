# Day 45 — API Testing with Postman

## Project

**Student Management System — Standalone Day 45**

React → Flask API → MySQL

## Objective

Test the backend API independently with Postman, verify valid and invalid requests, confirm database persistence, and then verify the same functionality through the React frontend.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | Retrieve all students |
| POST | `/api/students` | Create a student |

## Test Report

| Test | Method | Expected | Actual | Status |
|---|---|---|---|---|
| Get Students | GET | JSON list, 200 | Run in Postman | Pending |
| Create Student | POST | Created, 201 | Run in Postman | Pending |
| Empty Name | POST | JSON error, 400 | Run in Postman | Pending |
| Missing Email | POST | JSON error, 400 | Run in Postman | Pending |
| Missing Course | POST | JSON error, 400 | Run in Postman | Pending |
| Empty JSON | POST | JSON error, 400 | Run in Postman | Pending |
| No Request Body | POST | JSON error, 400 | Run in Postman | Pending |
| Duplicate Email | POST | JSON error, 400 | Run in Postman | Pending |
| Invalid Endpoint | GET | Not Found, 404 | Run in Postman | Pending |
| Unsupported Method | DELETE | Method Not Allowed, 405 | Run in Postman | Pending |

## Valid POST Body

```json
{
    "name": "Test Student",
    "email": "test.student@example.com",
    "course": "Computer Science"
}
```

## MySQL Verification

```sql
USE student_management;
SELECT * FROM students;
SELECT * FROM students WHERE email = 'test.student@example.com';
```

## HTTP Status Codes

- **200** — successful GET
- **201** — successful resource creation
- **400** — invalid client input
- **404** — endpoint does not exist
- **405** — HTTP method is not supported
- **500** — unexpected server-side error

## React Verification

GET:

React → fetch() → Flask → MySQL → JSON → React

POST:

React form → fetch() → Flask → MySQL → JSON response → React UI

## Screenshots

Place actual Postman screenshots in `screenshots/` after running the tests.

## Conclusion

The standalone Day 45 project provides a complete React frontend, Flask backend, MySQL schema, Postman collection, and API testing documentation. The final test results should be updated after executing the collection against the local application.
