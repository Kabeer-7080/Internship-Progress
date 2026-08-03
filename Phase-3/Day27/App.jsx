import "./App.css";
import StudentProfile from "./components/StudentProfile";

function App() {
  return (
    <div className="container">
      <h1>Student Profiles</h1>

      <div className="cards">
        <StudentProfile
          image="https://i.pravatar.cc/150?img=12"
          name="Mohamed Kabeer"
          age="20"
          course="AI & Data Science"
          college="XYZ College"
          email="kabeer@gmail.com"
        />

        <StudentProfile
          image="https://i.pravatar.cc/150?img=15"
          name="Rahul Sharma"
          age="21"
          course="Computer Science"
          college="ABC University"
          email="rahul@gmail.com"
        />

        <StudentProfile
          image="https://i.pravatar.cc/150?img=32"
          name="Priya Nair"
          age="19"
          course="Information Technology"
          college="DEF College"
          email="priya@gmail.com"
        />
      </div>
    </div>
  );
}

export default App;