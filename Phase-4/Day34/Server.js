const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Sample Database
let students = [
  {
    id: 1,
    name: "Mohamed Kabeer",
    department: "AI & Data Science"
  },
  {
    id: 2,
    name: "Rahul",
    department: "CSE"
  },
  {
    id: 3,
    name: "John",
    department: "IT"
  }
];

// Home Route
app.get("/", (req, res) => {
  res.send("Student REST API is Running!");
});

// GET All Students
app.get("/students", (req, res) => {
  res.json(students);
});

// GET Student by ID
app.get("/students/:id", (req, res) => {
  const student = students.find((s) => s.id == req.params.id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  res.json(student);
});

// POST Add Student
app.post("/students", (req, res) => {
  const newStudent = {
    id: req.body.id,
    name: req.body.name,
    department: req.body.department
  };

  students.push(newStudent);

  res.status(201).json({
    message: "Student Added Successfully",
    student: newStudent
  });
});

// PUT Update Student
app.put("/students/:id", (req, res) => {
  const student = students.find((s) => s.id == req.params.id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  student.name = req.body.name;
  student.department = req.body.department;

  res.json({
    message: "Student Updated Successfully",
    student
  });
});

// DELETE Student
app.delete("/students/:id", (req, res) => {
  const index = students.findIndex((s) => s.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  const deletedStudent = students.splice(index, 1);

  res.json({
    message: "Student Deleted Successfully",
    deletedStudent
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});