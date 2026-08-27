# Day 45 — Standalone Student Management

A complete standalone Student Management application for API testing with Postman.

## Stack

- React + Vite
- Flask
- MySQL
- Postman

## Project Structure

```text
Day_45_Student_Management/
├── backend/
├── database/
├── docs/
├── frontend/
├── postman/
└── screenshots/
```

## 1. Create the MySQL Database

Open MySQL Workbench/phpMyAdmin and run:

```text
database/student_management.sql
```

The script creates the `student_management` database, the `students` table, and five sample records.

## 2. Start the Flask Backend

Open a terminal:

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If your MySQL root account has a password, set it before starting Flask:

```bash
set DB_PASSWORD=YOUR_MYSQL_PASSWORD
```

Then:

```bash
python app.py
```

Backend:

```text
http://127.0.0.1:5000
```

## 3. Start React

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## 4. Test with Postman

Import:

```text
postman/Student Management API - Day 45.postman_collection.json
```

Run the requests in order.

## 5. Verify MySQL

After a successful POST:

```sql
USE student_management;
SELECT * FROM students;
```

## 6. Add Screenshots

Put actual Postman screenshots inside:

```text
screenshots/
```

## Important

The Flask backend must be running before Postman or React can access the API.
