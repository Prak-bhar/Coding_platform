import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getContests, getContestById, getContestSubmissions, getContestLeaderboard, getContestProblems, getContestParticipants, registerForContest, updateParticipantRating, getContestSummary } from '../controllers/contestController.js';
import { submitFeedback, getFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/', authMiddleware, getContests);
router.get('/:id', authMiddleware, getContestById);
router.get('/:id/submissions', authMiddleware, getContestSubmissions);
router.get('/:id/leaderboard', authMiddleware, getContestLeaderboard);
router.get('/:id/problems', authMiddleware, getContestProblems);
router.get('/:id/participants', authMiddleware, getContestParticipants);
router.post('/:id/register', authMiddleware, registerForContest);
router.put('/:id/participants/:userId/rating', authMiddleware, updateParticipantRating);
router.get('/:id/summary', authMiddleware, getContestSummary);

// Feedback Routes
router.post('/:id/feedback', authMiddleware, submitFeedback);
router.get('/:id/feedback', authMiddleware, getFeedback);

export default router;
