import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import {
  createAdminContest,
  addProblemToContestAdmin,
  createProblemWithTagsAdmin,
  getAdminContests,
  removeProblemFromContestAdmin,
  updateContestAdmin,
  deleteContestAdmin
} from '../controllers/adminContestController.js';

const router = express.Router();

router.post('/create', authenticateAdmin, createAdminContest);
router.post('/:contestId/problems', authenticateAdmin, addProblemToContestAdmin);
router.post('/problems', authenticateAdmin, createProblemWithTagsAdmin);
router.delete('/:contestId/problems/:problemId', authenticateAdmin, removeProblemFromContestAdmin);
router.put('/:contestId', authenticateAdmin, updateContestAdmin);
router.delete('/:contestId', authenticateAdmin, deleteContestAdmin);
router.get('/', authenticateAdmin, getAdminContests);

export default router;
