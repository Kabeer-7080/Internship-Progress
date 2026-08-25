import React, { useEffect, useState } from "react";
import "./style.css";

const API_STUDENTS = "http://127.0.0.1:5000/api/students";
const API_PREDICT = "http://127.0.0.1:5000/api/predict";

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ML Prediction State
  const [mlForm, setMlForm] = useState({ study_hours: "6", attendance: "85" });
  const [prediction, setPrediction] = useState(null);
  const [mlError, setMlError] = useState("");
  const [mlLoading, setMlLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setError("");
      const res = await fetch(API_STUDENTS);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      const list = Array.isArray(data) ? data : (Array.isArray(data?.students) ? data.students : []);
      setStudents(list);
    } catch (e) {
      setError(e.message);
      setStudents([]);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(API_STUDENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessage("Student created successfully.");
      setForm({ name: "", email: "", course: "" });
      loadStudents();
    } catch (e) {
      setError(e.message);
    }
  };

  const predictSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setMlError("");
    setMlLoading(true);

    try {
      const payload = {
        study_hours: mlForm.study_hours === "" ? "" : (isNaN(mlForm.study_hours) ? mlForm.study_hours : Number(mlForm.study_hours)),
        attendance: mlForm.attendance === "" ? "" : (isNaN(mlForm.attendance) ? mlForm.attendance : Number(mlForm.attendance))
      };

      const res = await fetch(API_PREDICT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Prediction request failed");
      }
      setPrediction(data.prediction);
    } catch (e) {
      setMlError(e.message);
    } finally {
      setMlLoading(false);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Student Management & ML Analytics</h1>
        <p>Day 46 — Machine Learning Model Integration</p>
      </header>

      {/* ML Prediction Card */}
      <section className="card ml-card">
        <div className="card-header-icon">
          <h2>🤖 ML Performance Predictor</h2>
          <span className="subtitle-tag">Logistic Regression Model</span>
        </div>
        <form onSubmit={predictSubmit} className="form-grid ml-form">
          <div className="input-group">
            <label htmlFor="study-hours-input">Study Hours / Day (0 - 24)</label>
            <input
              id="study-hours-input"
              type="text"
              placeholder="e.g. 6"
              value={mlForm.study_hours}
              onChange={e => setMlForm({ ...mlForm, study_hours: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="attendance-input">Attendance % (0 - 100)</label>
            <input
              id="attendance-input"
              type="text"
              placeholder="e.g. 85"
              value={mlForm.attendance}
              onChange={e => setMlForm({ ...mlForm, attendance: e.target.value })}
            />
          </div>
          <div className="input-group button-group">
            <label>&nbsp;</label>
            <button type="submit" disabled={mlLoading}>
              {mlLoading ? "Predicting..." : "Predict"}
            </button>
          </div>
        </form>

        {prediction && (
          <div className={`prediction-result ${prediction.toLowerCase()}`}>
            <span>Prediction Result:</span>
            <strong className="prediction-badge">{prediction}</strong>
          </div>
        )}

        {mlError && <div className="error">{mlError}</div>}
      </section>

      {/* Add Student Card */}
      <section className="card">
        <h2>Add Student</h2>
        <form onSubmit={submit} className="form-grid add-form">
          <div className="input-group">
            <label htmlFor="student-name">Full Name</label>
            <input
              id="student-name"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="student-email">Email Address</label>
            <input
              id="student-email"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="student-course">Course Name</label>
            <input
              id="student-course"
              placeholder="Course"
              value={form.course}
              onChange={e => setForm({ ...form, course: e.target.value })}
            />
          </div>
          <div className="input-group button-group">
            <label>&nbsp;</label>
            <button type="submit">Add Student</button>
          </div>
        </form>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </section>

      {/* Student List Card */}
      <section className="card">
        <div className="title-row">
          <h2>Students</h2>
          <button onClick={loadStudents}>Refresh</button>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Course</th></tr>
          </thead>
          <tbody>
            {Array.isArray(students) && students.map(s => (
              <tr key={s.id}>
                <td><strong>#{s.id}</strong></td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td><span className="badge">{s.course}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!Array.isArray(students) || !students.length) && <p className="muted">No students found.</p>}
      </section>
    </main>
  );
}
