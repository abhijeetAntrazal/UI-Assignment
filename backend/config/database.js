import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

//create a pool for connecting the backend to the mysql present on the localhost
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'healthsure',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//testing query to check whether the connection is working or not
pool.testConnection = async () => {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connected successfully:', rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export default pool;
