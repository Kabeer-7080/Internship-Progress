import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch student data");
        }
        return response.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="portal">
      <header>
        <h1>Student Information Portal</h1>
        <p>Student records loaded from Flask REST API</p>
      </header>

      <main>
        <div className="section-title">
          <div>
            <p>BACKEND DATA</p>
            <h2>Student Records</h2>
            <span>
              The records below are loaded dynamically from /api/students
            </span>
          </div>

          <div className="student-count">
            <strong>{students.length}</strong>
            <small>Students</small>
          </div>
        </div>

        {loading && <p className="message">Loading student data...</p>}

        {error && <p className="message error">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>STUDENT</th>
                <th>EMAIL</th>
                <th>COURSE</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>#{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default App;