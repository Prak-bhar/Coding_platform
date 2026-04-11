import pool from '../config/db.js';

/** GET /api/admin/analytics
 * Query params: batch (optional), department (optional), search (optional)
 * Returns: { users: [...], stats: {...} }
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    const { batch, department, search } = req.query;

    let sql = `SELECT u.id, u.name, u.email, u.rating, u.batch, d.name AS department
               FROM users u
               LEFT JOIN departments d ON u.department_id = d.id
               WHERE u.role = 'user'`;
    const params = [];

    if (batch) {
      sql += ' AND u.batch = ?';
      params.push(batch);
    }
    if (department) {
      sql += ' AND d.name = ?';
      params.push(department);
    }
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY u.rating DESC LIMIT 1000';

    const [users] = await pool.query(sql, params);

    // stats
    const [[totalUsers]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'user'");
    const [[totalFaculty]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'faculty'");
    const [[totalAdmins]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'");
    const [[totalProblems]] = await pool.query('SELECT COUNT(*) AS count FROM problems');
    const [[totalContests]] = await pool.query('SELECT COUNT(*) AS count FROM contests');
    const [[totalSubmissions]] = await pool.query('SELECT COUNT(*) AS count FROM submissions');

    const stats = {
      users: totalUsers.count,
      faculty: totalFaculty.count,
      admins: totalAdmins.count,
      problems: totalProblems.count,
      contests: totalContests.count,
      submissions: totalSubmissions.count,
    };

    // batch-wise aggregates: highest rating, highest solved_count, avg rating, avg solved
    const batchSql = `
      WITH user_solved AS (
        SELECT u.id, u.batch, u.rating,
          (SELECT COUNT(DISTINCT s.problem_id) FROM submissions s WHERE s.user_id = u.id AND s.verdict = 'AC') AS solved_count
        FROM users u
        WHERE u.role = 'user'
      )
      SELECT
        COALESCE(batch, 'unknown') AS batch,
        MAX(rating) AS highest_rating,
        MAX(solved_count) AS highest_solved,
        AVG(rating) AS avg_rating,
        AVG(solved_count) AS avg_solved,
        COUNT(*) AS users_count
      FROM user_solved
      GROUP BY batch
      ORDER BY batch ASC
    `;

    const [batchStats] = await pool.query(batchSql);

    // department-wise aggregates
    const deptSql = `
      WITH user_solved AS (
        SELECT u.id, d.name AS department, u.rating,
          (SELECT COUNT(DISTINCT s.problem_id) FROM submissions s WHERE s.user_id = u.id AND s.verdict = 'AC') AS solved_count
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.role = 'user'
      )
      SELECT
        COALESCE(department, 'unknown') AS department,
        MAX(rating) AS highest_rating,
        MAX(solved_count) AS highest_solved,
        AVG(rating) AS avg_rating,
        AVG(solved_count) AS avg_solved,
        COUNT(*) AS users_count
      FROM user_solved
      GROUP BY department
      ORDER BY department ASC
    `;

    const [departmentStats] = await pool.query(deptSql);
    if (req.query.format === 'csv' || req.query.download === '1' || req.path.includes('download')) {
      const headerBatch = 'batch,users_count,highest_rating,highest_solved,avg_rating,avg_solved\n';
      const linesBatch = batchStats.map(b =>
        `${b.batch},${b.users_count},${b.highest_rating || 0},${b.highest_solved || 0},${Number(b.avg_rating || 0).toFixed(2)},${Number(b.avg_solved || 0).toFixed(2)}`
      );

      const headerDept = 'department,users_count,highest_rating,highest_solved,avg_rating,avg_solved\n';
      const linesDept = departmentStats.map(d =>
        `${d.department},${d.users_count},${d.highest_rating || 0},${d.highest_solved || 0},${Number(d.avg_rating || 0).toFixed(2)},${Number(d.avg_solved || 0).toFixed(2)}`
      );

      const csv = headerBatch + linesBatch.join('\n') + '\n\n' + headerDept + linesDept.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="admin_batch_department_stats.csv"');
      return res.send(csv);
    }

    res.json({ users, stats, batchStats, departmentStats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
