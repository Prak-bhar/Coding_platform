import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows;
};

export const createUser = async ({ name, email, password, role, department_id, batch, rating }) => {
    const [result] = await pool.query(
        `INSERT INTO users (name, email, password, role, department_id, batch, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, email, password, role, department_id, batch, rating]
    );
    return result;
};
