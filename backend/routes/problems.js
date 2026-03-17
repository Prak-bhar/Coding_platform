// src/routes/problems.js
import express from 'express';
import { getProblems } from '../controllers/problemsController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.get('/', authMiddleware, getProblems);

export default router;
