require("dotenv").config();
const mysql = require("mysql2");

const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    database: process.env.DB_NAME || "portdb",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

if (process.env.DB_PASSWORD) {
    config.password = process.env.DB_PASSWORD;
}

const db = mysql.createConnection(config);

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        console.error(`DB host=${config.host}, user=${config.user}, database=${config.database}, port=${config.port}`);
        process.exit(1);
    }

    console.log("MySQL connected successfully!");
});

module.exports = db;