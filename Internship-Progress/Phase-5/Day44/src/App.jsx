import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load students");
      }
      setStudents(data.students);
    } catch (err) {
      setError(err.message || "Unable to connect to Flask backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.course.trim()) {
      setError("Please fill in name, email, and course.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save student");
      }

      setMessage(data.message);
      setForm({ name: "", email: "", course: "" });
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to save student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">DAY 44 • FULL-STACK DATABASE INTEGRATION</p>
          <h1>Student Management</h1>
          <p className="subtitle">React → Flask API → MySQL</p>
        </div>
        <div className="status">● MySQL Connected Architecture</div>
      </header>

      <main className="container">
        <section className="card form-card">
          <h2>Add Student</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid">
              <input name="name" placeholder="Student name" value={form.name} onChange={handleChange} />
              <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} />
              <input name="course" placeholder="Course" value={form.course} onChange={handleChange} />
            </div>
            <button disabled={submitting}>
              {submitting ? "Saving..." : "Add Student"}
            </button>
          </form>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h2>Student List</h2>
              <p>Records loaded directly from MySQL through Flask.</p>
            </div>
            <button className="secondary" onClick={loadStudents}>Refresh</button>
          </div>

          {loading ? (
            <div className="loading">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="loading">No students found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td><span className="badge">{student.course}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
