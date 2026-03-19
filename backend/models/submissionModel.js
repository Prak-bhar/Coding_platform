import pool from '../config/db.js';

export const getContestById = async (contestId) => {
    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    return contest;
};

export const checkContestRegistration = async (contestId, userId) => {
    const [regRows] = await pool.query(
        'SELECT 1 FROM contest_participants WHERE contest_id = ? AND user_id = ? LIMIT 1',
        [contestId, userId]
    );
    return regRows;
};

export const createSubmissionRecord = async (userId, contestId, problemId, verdict) => {
    const [result] = await pool.query(
        `INSERT INTO submissions (user_id, contest_id, problem_id, verdict) VALUES (?, ?, ?, ?)`,
        [userId, contestId, problemId, verdict]
    );
    return result;
};

export const getSubmissionWithDetails = async (submissionId) => {
    const [[submission]] = await pool.query(
        `SELECT s.*, u.name AS user_name, p.title AS problem_title
       FROM submissions s
       JOIN users u ON s.user_id = u.id
       JOIN problems p ON s.problem_id = p.id
       WHERE s.id = ?`,
        [submissionId]
    );
    return submission;
};

export const getUserSubmissionsList = async (userId) => {
    const [rows] = await pool.query(
        `SELECT s.*, p.title FROM submissions s JOIN problems p ON p.id = s.problem_id WHERE s.user_id = ? ORDER BY s.created_at DESC LIMIT 200`,
        [userId]
    );
    return rows;
};
