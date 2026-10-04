const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to MySQL
// Using Aiven's connection string and enabling SSL
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false // Required for Aiven MySQL
  }
});

// Test the connection
pool.getConnection()
  .then((conn) => {
    console.log('✅ Connected to MySQL database successfully.');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MySQL:', err.message);
  });

module.exports = pool;
