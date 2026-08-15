CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL
);

INSERT INTO students (name, email, course) VALUES
('Arun Kumar', 'arun@example.com', 'AI & Data Science'),
('Priya Sharma', 'priya@example.com', 'Computer Science'),
('Rahul Das', 'rahul@example.com', 'Information Technology'),
('Sneha Nair', 'sneha@example.com', 'Data Science'),
('Vishal Raj', 'vishal@example.com', 'Artificial Intelligence');

SELECT * FROM students;
