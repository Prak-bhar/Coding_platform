import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const initDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fsd_project', // The user created this database
      multipleStatements: true
    });

    const schema = fs.readFileSync('./schema.sql', 'utf8');
    await connection.query(schema);
    console.log('Database schema created successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error executing schema:', err);
    process.exit(1);
  }
};

initDB();
