import pool from '../config/db.js';

export const getContestsList = async (role, department_id) => {
    let query = `
      SELECT c.*, d.name AS department_name
      FROM contests c
      LEFT JOIN departments d ON c.department_id = d.id
    `;
    let params = [];
    if (role !== 'admin') {
        query += ` WHERE c.department_id IS NULL OR c.department_id = ? ORDER BY c.start_time DESC `;
        params = [department_id];
    } else {
        query += ` ORDER BY c.start_time DESC `;
    }
    const [rows] = await pool.query(query, params);
    return rows;
};

export const getContestAndProblems = async (contestId, userRole, userDept) => {
    const [[contest]] = await pool.query(
        'SELECT c.*, d.name AS department_name FROM contests c LEFT JOIN departments d ON c.department_id = d.id WHERE c.id = ?',
        [contestId]
    );
    if (!contest) return { contest: null, problems: [] };

    if (contest.department_id && userRole === 'user' && userDept !== contest.department_id) {
        return { contest, forbidden: true };
    }

    const [problems] = await pool.query(
        `SELECT p.*, cp.id as contest_problem_id
       FROM contest_problems cp
       JOIN problems p ON cp.problem_id = p.id
       WHERE cp.contest_id = ?
       ORDER BY cp.id ASC`,
        [contestId]
    );
    return { contest, problems };
};

export const getContestById = async (contestId) => {
    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    return contest;
};

export const getSubmissionsInContest = async (contestId, contestStart, contestEnd, filters, limit, offset) => {
    const { user_id, user_name, verdict, problem_id, problem_title } = filters;
    let sql = `
      SELECT s.id AS submission_id, u.id AS user_id, u.name AS user_name,
        s.problem_id, p.title AS problem_title, s.verdict, s.created_at
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE s.contest_id = ? AND s.created_at BETWEEN ? AND ?
    `;
    const params = [contestId, contestStart, contestEnd];

    if (user_id) { sql += ' AND s.user_id = ?'; params.push(user_id); }
    if (user_name) { sql += ' AND u.name LIKE ?'; params.push(`%${user_name}%`); }
    if (verdict) { sql += ' AND s.verdict = ?'; params.push(verdict); }
    if (problem_id) { sql += ' AND s.problem_id = ?'; params.push(problem_id); }
    if (problem_title) { sql += ' AND p.title LIKE ?'; params.push(`%${problem_title}%`); }

    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(sql, params);
    return rows;
};

export const getLeaderboardData = async (contestId, startTime, endTime) => {
    const sql = `
      WITH
        s_in AS (
          SELECT s.* FROM submissions s WHERE s.contest_id = ? AND s.created_at BETWEEN ? AND ?
        ),
        first_ac AS (
          SELECT user_id, problem_id, MIN(created_at) AS first_ac_time FROM s_in WHERE verdict = 'AC' GROUP BY user_id, problem_id
        ),
        wrong_before AS (
          SELECT si.user_id, si.problem_id, COUNT(*) AS wrong_cnt FROM s_in si
          LEFT JOIN first_ac fa ON si.user_id = fa.user_id AND si.problem_id = fa.problem_id
          WHERE si.verdict <> 'AC' AND (fa.first_ac_time IS NULL OR si.created_at < fa.first_ac_time)
          GROUP BY si.user_id, si.problem_id
        ),
        per_problem AS (
          SELECT fa.user_id, fa.problem_id, TIMESTAMPDIFF(MINUTE, (SELECT start_time FROM contests WHERE id = ?), fa.first_ac_time) AS minutes_to_ac,
            COALESCE(wb.wrong_cnt, 0) AS wrong_before
          FROM first_ac fa LEFT JOIN wrong_before wb ON fa.user_id = wb.user_id AND fa.problem_id = wb.problem_id
        ),
        per_user AS (
          SELECT u.id AS user_id, u.name AS user_name, COUNT(DISTINCT pp.problem_id) AS solved_count,
            COALESCE(SUM(pp.minutes_to_ac), 0) AS time_sum_minutes, COALESCE(SUM(pp.wrong_before), 0) AS wrong_before_total
          FROM users u LEFT JOIN per_problem pp ON u.id = pp.user_id JOIN contest_participants cp ON cp.user_id = u.id AND cp.contest_id = ?
          GROUP BY u.id
        )
      SELECT pu.user_id, pu.user_name, pu.solved_count, pu.time_sum_minutes, pu.wrong_before_total, (pu.time_sum_minutes + pu.wrong_before_total * 20) AS penalty
      FROM per_user pu ORDER BY pu.solved_count DESC, penalty ASC, pu.user_name ASC LIMIT 500;
    `;
    const params = [contestId, startTime, endTime, contestId, contestId];
    const [rows] = await pool.query(sql, params);
    return rows;
};

export const getContestProblemsAccessible = async (contestId, role, userDept) => {
    let contestQuery, contestParams;
    if (role === 'admin') {
      contestQuery = `SELECT * FROM contests WHERE id = ?`;
      contestParams = [contestId];
    } else {
      contestQuery = `SELECT * FROM contests WHERE id = ? AND (department_id IS NULL OR department_id = ?)`;
      contestParams = [contestId, userDept];
    }
    const [contestRows] = await pool.query(contestQuery, contestParams);
    if (contestRows.length === 0) return { contest: null, problems: [] };
    
    const contest = contestRows[0];
    const [problems] = await pool.query(
      `SELECT p.id, p.title, p.difficulty, p.visible, p.created_by, p.created_at,
         (SELECT GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') FROM problem_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.problem_id = p.id) AS tags,
         cp.id AS contest_problem_id
       FROM contest_problems cp JOIN problems p ON cp.problem_id = p.id WHERE cp.contest_id = ? ORDER BY cp.id ASC`,
      [contestId]
    );
    return { contest, problems };
};

export const getParticipantsAndMe = async (contestId, userId) => {
    const [rows] = await pool.query(
      `SELECT cp.user_id, u.name AS user_name, cp.rating_before, cp.rating_after, cp.id AS cp_id
       FROM contest_participants cp JOIN users u ON u.id = cp.user_id WHERE cp.contest_id = ? ORDER BY cp.id ASC`,
      [contestId]
    );
    const [me] = await pool.query(`SELECT 1 FROM contest_participants WHERE contest_id = ? AND user_id = ? LIMIT 1`, [contestId, userId]);
    return { participants: rows, registered: me.length > 0 };
};

export const getParticipant = async (contestId, userId) => {
    const [cpRows] = await pool.query('SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?', [contestId, userId]);
    return cpRows.length > 0 ? cpRows[0] : null;
};

export const updateParticipantRatingRecord = async (contestId, userId, rating_after) => {
    await pool.query('UPDATE contest_participants SET rating_after = ? WHERE contest_id = ? AND user_id = ?', [rating_after, contestId, userId]);
    await pool.query('UPDATE users SET rating = ? WHERE id = ?', [rating_after, userId]);
    const [[updatedCp]] = await pool.query(
      `SELECT cp.user_id, u.name AS user_name, cp.rating_before, cp.rating_after FROM contest_participants cp JOIN users u ON u.id = cp.user_id
       WHERE cp.contest_id = ? AND cp.user_id = ?`,
      [contestId, userId]
    );
    return updatedCp;
};

export const getParticipantCount = async (contestId) => {
    const [[pc]] = await pool.query('SELECT COUNT(*) AS participants_count FROM contest_participants WHERE contest_id = ?', [contestId]);
    return pc.participants_count || 0;
};

export const getSolverCount = async (contestId, startTime, endTime) => {
    const [[sc]] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS solvers_count FROM submissions WHERE contest_id = ? AND verdict = 'AC' AND created_at BETWEEN ? AND ?`,
      [contestId, startTime, endTime]
    );
    return sc.solvers_count || 0;
};

export const getContestSummaryStats = async (contestId, startTime, endTime) => {
    const sql = `
      WITH s_in AS ( SELECT * FROM submissions WHERE contest_id = ? AND created_at BETWEEN ? AND ? ),
      first_ac AS ( SELECT user_id, problem_id, MIN(created_at) AS first_ac_time FROM s_in WHERE verdict = 'AC' GROUP BY user_id, problem_id ),
      submissions_to_ac AS ( SELECT fa.user_id, fa.problem_id, COUNT(si.id) AS submissions_to_ac FROM s_in si JOIN first_ac fa ON si.user_id = fa.user_id AND si.problem_id = fa.problem_id AND si.created_at <= fa.first_ac_time GROUP BY fa.user_id, fa.problem_id )
      SELECT p.id AS problem_id, p.title AS problem_title, (SELECT COUNT(*) FROM s_in si WHERE si.problem_id = p.id) AS submissions,
        (SELECT COUNT(*) FROM s_in si WHERE si.problem_id = p.id AND si.verdict = 'AC') AS ac_count,
        (SELECT COUNT(DISTINCT user_id) FROM first_ac fa WHERE fa.problem_id = p.id) AS unique_solvers,
        (SELECT AVG(submissions_to_ac) FROM submissions_to_ac st WHERE st.problem_id = p.id) AS avg_submissions_to_ac
      FROM contest_problems cp JOIN problems p ON cp.problem_id = p.id WHERE cp.contest_id = ? ORDER BY p.id ASC
    `;
    const [rows] = await pool.query(sql, [contestId, startTime, endTime, contestId]);
    return rows;
};

export const registerParticipant = async (contestId, userId) => {
    await pool.query(
      `INSERT IGNORE INTO contest_participants (contest_id, user_id, rating_before) VALUES (?, ?, (SELECT rating FROM users WHERE id = ?))`,
      [contestId, userId, userId]
    );
    const [rows] = await pool.query(
      `SELECT cp.user_id, u.name AS user_name, cp.rating_before, cp.rating_after FROM contest_participants cp JOIN users u ON u.id = cp.user_id
       WHERE cp.contest_id = ? ORDER BY cp.id ASC`,
      [contestId]
    );
    return rows;
};
