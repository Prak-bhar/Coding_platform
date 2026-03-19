import express from 'express';
import { getBlogs, getBlogById, createBlog, deleteBlog, addComment, likeBlog } from '../controllers/blogController.js';
import { authMiddleware } from '../middleware/auth.js'; 

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Protected routes (require user to be logged in)
router.use(authMiddleware);

router.post('/', createBlog); // Only Faculty and Admin can create via controller logic
router.delete('/:id', deleteBlog);
router.post('/:id/comments', addComment);
router.post('/:id/like', likeBlog);

export default router;
