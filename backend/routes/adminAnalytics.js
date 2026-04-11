import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { getAdminAnalytics } from '../controllers/adminAnalyticsController.js';

const router = express.Router();

router.get('/', authenticateAdmin, getAdminAnalytics);
router.get('/download', authenticateAdmin, (req, res, next) => {
  req.query.download = '1';
  return getAdminAnalytics(req, res, next);
});

export default router;
