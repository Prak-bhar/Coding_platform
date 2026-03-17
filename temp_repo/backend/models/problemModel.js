import pool from '../config/db.js';

export const getProblemsWithStats = async (difficulty, q, limit, offset) => {
    let base = `
      SELECT p.*, 
        IFNULL((
          SELECT ROUND(100 * SUM(s.verdict = 'AC') / COUNT(*), 2)
          FROM submissions s WHERE s.problem_id = p.id
        ), 0) AS ac_percent,
        IF(EXISTS(
          SELECT 1 FROM contest_problems cp
          JOIN contests c ON c.id = cp.contest_id
          WHERE cp.problem_id = p.id AND c.end_time > NOW()
        ), 0, 1) AS is_visible_now
      FROM problems p
    `;

    const where = [];
    const params = [];

    if (difficulty) {
        where.push('p.difficulty = ?');
        params.push(difficulty);
    }
    if (q) {
        where.push('(p.title LIKE ? OR p.statement LIKE ?)');
        params.push(`%${q}%`, `%${q}%`);
    }

    if (where.length) base += ' WHERE ' + where.join(' AND ');
    base += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(base, params);
    return rows;
};

export const getTagsForProblem = async (problemId) => {
    const [ptags] = await pool.query(
        `SELECT t.name FROM tags t 
         JOIN problem_tags pt ON pt.tag_id = t.id 
         WHERE pt.problem_id = ?`,
        [problemId]
    );
    return ptags;
};
