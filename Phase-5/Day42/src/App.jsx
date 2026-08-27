import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:5000/api/students";

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setStudents(data))
      .catch((error) => console.error(error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          course,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStudents((prev) => [...prev, data.student]);
        setName("");
        setEmail("");
        setCourse("");
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="page">
      <h1>Student Registration</h1>

      <div className="form-card">
        <h2>Add Student</h2>

        <form onSubmit={handleSubmit}>
          <label>Student Name</label>
          <input
            placeholder="Enter student name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Course</label>
          <input
            placeholder="Enter course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Student"}
          </button>
        </form>
      </div>

      <div className="students-card">
        <h2>Students</h2>

        {students.map((student) => (
          <div className="student" key={student.id}>
            <div className="avatar">
              {student.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{student.name}</strong>
              <p>{student.email}</p>
              <small>{student.course}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;