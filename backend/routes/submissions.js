// src/routes/submissions.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createSubmission, getUserSubmissions } from '../controllers/submissionsController.js';
const router = express.Router();

router.post('/', authMiddleware, createSubmission);
router.get('/me', authMiddleware, getUserSubmissions);

export default router;
