# Day 41 – API Flow

## Student Information Portal

### Backend
- Framework: Flask
- API Endpoint: GET /api/students
- Server: http://127.0.0.1:5000

### Frontend
- Framework: React
- Build Tool: Vite
- API Communication: fetch()

### API Flow

React Frontend
↓
GET /api/students
↓
Flask Backend
↓
JSON Student Data
↓
React displays student records

### API Testing

The API was tested using Thunder Client.

**Method:** GET

**Endpoint:**
http://127.0.0.1:5000/api/students

**Response:** 200 OK

The API successfully returned student information in JSON format.