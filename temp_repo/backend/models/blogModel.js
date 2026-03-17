import pool from '../config/db.js';

export const getAllBlogs = async () => {
    const [rows] = await pool.query(
        `SELECT b.*, u.name as author_name, u.role as author_role 
         FROM blogs b JOIN users u ON b.author_id = u.id 
         ORDER BY b.created_at DESC`
    );
    return rows;
};

export const getBlogById = async (blogId) => {
    const [[blog]] = await pool.query(
        `SELECT b.*, u.name as author_name, u.role as author_role 
         FROM blogs b JOIN users u ON b.author_id = u.id 
         WHERE b.id = ?`,
        [blogId]
    );

    if (blog) {
        const [comments] = await pool.query(
            `SELECT c.*, u.name as user_name 
             FROM blog_comments c JOIN users u ON c.user_id = u.id 
             WHERE c.blog_id = ? ORDER BY c.created_at ASC`,
            [blogId]
        );
        blog.comments = comments;
    }
    return blog;
};

export const createBlog = async (title, content, authorId) => {
    const [result] = await pool.query(
        'INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)',
        [title, content, authorId]
    );
    return result.insertId;
};

export const deleteBlog = async (blogId, authorId, userRole) => {
    // Only author or admin can delete
    let query, params;
    if (userRole === 'admin') {
        query = 'DELETE FROM blogs WHERE id = ?';
        params = [blogId];
    } else {
        query = 'DELETE FROM blogs WHERE id = ? AND author_id = ?';
        params = [blogId, authorId];
    }
    const [result] = await pool.query(query, params);
    return result.affectedRows;
};

export const addComment = async (blogId, userId, text) => {
    const [result] = await pool.query(
        'INSERT INTO blog_comments (blog_id, user_id, text) VALUES (?, ?, ?)',
        [blogId, userId, text]
    );
    
    // Fetch newly created comment to return to client immediately
    const [[comment]] = await pool.query(
        `SELECT c.*, u.name as user_name 
         FROM blog_comments c JOIN users u ON c.user_id = u.id 
         WHERE c.id = ?`,
        [result.insertId]
    );
    return comment;
};

export const toggleLike = async (blogId, userId) => {
    // Simple like counter incrementing for MVP since no relation table was created for likes.
    const [result] = await pool.query('UPDATE blogs SET likes = likes + 1 WHERE id = ?', [blogId]);
    return result.affectedRows;
};
