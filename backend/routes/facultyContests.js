import express from 'express';
import { authenticateFaculty } from '../middleware/auth.js';
import {
  createContest,
  addProblemToContest,
  createProblemWithTags,
  removeProblemFromContest,
  updateContest,
  deleteContest,
  getFacultyContests
} from '../controllers/facultyContestController.js';

const router = express.Router();

router.post('/create', authenticateFaculty, createContest);
router.post('/:contestId/problems', authenticateFaculty, addProblemToContest);
router.post('/problems', authenticateFaculty, createProblemWithTags);
router.delete('/:contestId/problems/:problemId', authenticateFaculty, removeProblemFromContest);
router.put('/:contestId', authenticateFaculty, updateContest);
router.delete('/:contestId', authenticateFaculty, deleteContest);
router.get('/', authenticateFaculty, getFacultyContests);

export default router;
