import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://127.0.0.1:5000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStudents = async () => {
    try {
      setError("");
      const res = await fetch(API);
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
      const res = await fetch(API, {
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

  return (
    <main className="container">
      <header>
        <h1>Student Management</h1>
        <p>Day 45 — API Testing with Postman</p>
      </header>

      <section className="card">
        <h2>Add Student</h2>
        <form onSubmit={submit}>
          <input placeholder="Name" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Email" type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
          <input placeholder="Course" value={form.course}
            onChange={e => setForm({...form, course: e.target.value})} />
          <button type="submit">Add Student</button>
        </form>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </section>

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

createRoot(document.getElementById("root")).render(<App />);
