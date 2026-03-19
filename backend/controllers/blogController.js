import * as blogModel from '../models/blogModel.js';

export const getBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.getAllBlogs();
        res.json({ blogs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch blogs' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await blogModel.getBlogById(blogId);
        
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        
        res.json({ blog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch blog entries' });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const authorId = req.user.id;
        const role = req.user.role;

        // Ensure only faculty or admin can post blogs
        if (role !== 'faculty' && role !== 'admin') {
            return res.status(403).json({ message: 'Only faculty or admins can post blogs' });
        }
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const insertId = await blogModel.createBlog(title, content, authorId);
        const newBlog = await blogModel.getBlogById(insertId);
        
        res.status(201).json({ success: true, blog: newBlog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create blog' });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const affectedRows = await blogModel.deleteBlog(blogId, req.user.id, req.user.role);
        
        if (affectedRows === 0) {
            return res.status(403).json({ message: 'Not authorized to delete this blog, or blog not found' });
        }
        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete blog' });
    }
};

export const addComment = async (req, res) => {
    try {
        const blogId = req.params.id;
        const { text } = req.body;
        const userId = req.user.id;

        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        // Ensure blog exists
        const blog = await blogModel.getBlogById(blogId);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        const createdComment = await blogModel.addComment(blogId, userId, text);
        res.status(201).json({ success: true, comment: createdComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        // In a full implementation, you'd check a blog_likes table to prevent multiple likes. 
        // For this simplified version we just increment the counter.
        const affectedRows = await blogModel.toggleLike(blogId, req.user.id);

        if (affectedRows === 0) return res.status(404).json({ message: 'Blog not found' });

        res.json({ success: true, message: 'Blog liked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to like blog' });
    }
};
