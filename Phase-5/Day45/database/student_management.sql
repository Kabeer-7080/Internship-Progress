CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL
);

INSERT INTO students (name, email, course) VALUES
('Arun Kumar', 'arun@example.com', 'Computer Science'),
('Priya Sharma', 'priya@example.com', 'Information Technology'),
('Rahul Das', 'rahul@example.com', 'Data Science'),
('Ananya Rao', 'ananya@example.com', 'Computer Applications'),
('Vikram Singh', 'vikram@example.com', 'Cyber Security');
