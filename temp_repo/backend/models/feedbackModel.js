import pool from '../config/db.js';

export const submitFeedback = async (contestId, userId, rating, comment) => {
    // Upsert logic: if user already submitted feedback, update it instead of crashing.
    const [existing] = await pool.query(
        'SELECT id FROM contest_feedback WHERE contest_id = ? AND user_id = ?',
        [contestId, userId]
    );

    if (existing.length > 0) {
        const [result] = await pool.query(
            'UPDATE contest_feedback SET rating = ?, comment = ? WHERE id = ?',
            [rating, comment, existing[0].id]
        );
        return { id: existing[0].id, updated: true };
    } else {
        const [result] = await pool.query(
            'INSERT INTO contest_feedback (contest_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [contestId, userId, rating, comment]
        );
        return { id: result.insertId, updated: false };
    }
};

export const getContestFeedback = async (contestId) => {
    const [rows] = await pool.query(
        `SELECT cf.*, u.name as user_name 
         FROM contest_feedback cf 
         JOIN users u ON cf.user_id = u.id 
         WHERE cf.contest_id = ? 
         ORDER BY cf.created_at DESC`,
        [contestId]
    );
    return rows;
};

export const getContestFeedbackAnalytics = async (contestId) => {
    const [[stats]] = await pool.query(
        `SELECT 
            COUNT(*) as total_feedback,
            AVG(rating) as average_rating,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
         FROM contest_feedback 
         WHERE contest_id = ?`,
        [contestId]
    );
    return stats;
};
