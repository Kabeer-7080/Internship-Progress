const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, "public")));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Views", "index.html"));
});

// About Page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "Views", "about.html"));
});

// Contact Page
app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "Views", "contact.html"));
});

// Plain Text Route
app.get("/hello", (req, res) => {
    res.send("Hello! Welcome to my Express Server.");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});