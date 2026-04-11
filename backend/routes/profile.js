import express from 'express';
import { getProfile, getProfileById } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authMiddleware, getProfile);
router.get('/:id', authMiddleware, getProfileById);

export default router;
