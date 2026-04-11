// controllers/profileController.js
import pool from '../config/db.js';

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Basic user info + department name
        const [[user]] = await pool.query(
            `SELECT u.id, u.name, u.email, u.batch, u.rating, u.role,
              d.name AS department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
            [userId]
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Count submissions and verdict distribution
        const [stats] = await pool.query(
            `SELECT verdict, COUNT(*) AS count 
       FROM submissions 
       WHERE user_id = ? 
       GROUP BY verdict`,
            [userId]
        );

        const total = stats.reduce((a, s) => a + s.count, 0);
        const ac = stats.find(s => s.verdict === 'AC')?.count || 0;
        const ac_percent = total ? ((ac / total) * 100).toFixed(1) : 0;

        // Weak topics: most wrong submissions by tag
        const [weakTopics] = await pool.query(
            `SELECT t.name, 
              SUM(CASE WHEN s.verdict != 'AC' THEN 1 ELSE 0 END) AS wrong_count,
              COUNT(*) AS total_subs,
              ROUND(SUM(CASE WHEN s.verdict != 'AC' THEN 1 ELSE 0 END)/COUNT(*)*100, 1) AS wrong_percent
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       JOIN problem_tags pt ON p.id = pt.problem_id
       JOIN tags t ON pt.tag_id = t.id
       WHERE s.user_id = ?
       GROUP BY t.id
       HAVING total_subs >= 2
       ORDER BY wrong_percent DESC
       LIMIT 5`,
            [userId]
        );

        // difficulty counts (attempted and solved per difficulty)
        const [difficultyCounts] = await pool.query(
          `SELECT p.difficulty,
            COUNT(DISTINCT p.id) AS attempted,
            COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN p.id END) AS solved
           FROM submissions s
           JOIN problems p ON s.problem_id = p.id
           WHERE s.user_id = ?
           GROUP BY p.difficulty`,
          [userId]
        );

        // tag-wise problem counts (distinct problems attempted and solved per tag)
        const [tagCounts] = await pool.query(
          `SELECT t.name,
            COUNT(DISTINCT p.id) AS attempted,
            COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN p.id END) AS solved
           FROM submissions s
           JOIN problems p ON s.problem_id = p.id
           JOIN problem_tags pt ON p.id = pt.problem_id
           JOIN tags t ON pt.tag_id = t.id
           WHERE s.user_id = ?
           GROUP BY t.id
           ORDER BY attempted DESC`,
          [userId]
        );

        // contests participated and recent contest history
        const [[contestsCountRow]] = await pool.query(
          'SELECT COUNT(*) AS cnt FROM contest_participants WHERE user_id = ?',
          [userId]
        );
        const contestsCount = contestsCountRow.cnt || 0;

        const [contestHistory] = await pool.query(
          `SELECT c.id, c.title, c.start_time, c.end_time,
            (SELECT COUNT(DISTINCT s.problem_id) FROM submissions s WHERE s.user_id = ? AND s.contest_id = c.id AND s.verdict = 'AC' AND s.created_at BETWEEN c.start_time AND c.end_time) AS solved_count
           FROM contest_participants cp
           JOIN contests c ON cp.contest_id = c.id
           WHERE cp.user_id = ?
           ORDER BY c.start_time DESC
           LIMIT 20`,
          [userId, userId]
        );

        res.json({
            user,
            stats: { total, ac, ac_percent },
            weak_topics: weakTopics,
            difficulty_counts: difficultyCounts,
            tag_counts: tagCounts,
            contests_count: contestsCount,
            contest_history: contestHistory,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load profile' });
    }
};

export const getProfileById = async (req, res) => {
  try {
    const userId = req.params.id;

    const [[user]] = await pool.query(
      `SELECT u.id, u.name, u.email, u.batch, u.rating, u.role,
              d.name AS department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    const [stats] = await pool.query(
      `SELECT verdict, COUNT(*) AS count 
       FROM submissions 
       WHERE user_id = ? 
       GROUP BY verdict`,
      [userId]
    );

    const total = stats.reduce((a, s) => a + s.count, 0);
    const ac = stats.find(s => s.verdict === 'AC')?.count || 0;
    const ac_percent = total ? ((ac / total) * 100).toFixed(1) : 0;

    const [weakTopics] = await pool.query(
      `SELECT t.name, 
              SUM(CASE WHEN s.verdict != 'AC' THEN 1 ELSE 0 END) AS wrong_count,
              COUNT(*) AS total_subs,
              ROUND(SUM(CASE WHEN s.verdict != 'AC' THEN 1 ELSE 0 END)/COUNT(*)*100, 1) AS wrong_percent
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       JOIN problem_tags pt ON p.id = pt.problem_id
       JOIN tags t ON pt.tag_id = t.id
       WHERE s.user_id = ?
       GROUP BY t.id
       HAVING total_subs >= 2
       ORDER BY wrong_percent DESC
       LIMIT 5`,
      [userId]
    );

    // difficulty counts
    const [difficultyCounts] = await pool.query(
      `SELECT p.difficulty,
        COUNT(DISTINCT p.id) AS attempted,
        COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN p.id END) AS solved
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.user_id = ?
       GROUP BY p.difficulty`,
      [userId]
    );

    const [tagCounts] = await pool.query(
      `SELECT t.name,
        COUNT(DISTINCT p.id) AS attempted,
        COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN p.id END) AS solved
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       JOIN problem_tags pt ON p.id = pt.problem_id
       JOIN tags t ON pt.tag_id = t.id
       WHERE s.user_id = ?
       GROUP BY t.id
       ORDER BY attempted DESC`,
      [userId]
    );

    const [[contestsCountRow]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM contest_participants WHERE user_id = ?',
      [userId]
    );
    const contestsCount = contestsCountRow.cnt || 0;

    const [contestHistory] = await pool.query(
      `SELECT c.id, c.title, c.start_time, c.end_time,
        (SELECT COUNT(DISTINCT s.problem_id) FROM submissions s WHERE s.user_id = ? AND s.contest_id = c.id AND s.verdict = 'AC' AND s.created_at BETWEEN c.start_time AND c.end_time) AS solved_count
       FROM contest_participants cp
       JOIN contests c ON cp.contest_id = c.id
       WHERE cp.user_id = ?
       ORDER BY c.start_time DESC
       LIMIT 20`,
      [userId, userId]
    );

    res.json({
      user,
      stats: { total, ac, ac_percent },
      weak_topics: weakTopics,
      difficulty_counts: difficultyCounts,
      tag_counts: tagCounts,
      contests_count: contestsCount,
      contest_history: contestHistory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load user profile' });
  }
};