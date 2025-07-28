import express from 'express';
import { auth } from '../middleware/auth';
import {
  getAnalytics,
  getMetrics,
  exportData,
} from '../controllers/analyticsController';

const router = express.Router();

// Get analytics data
router.get('/', auth, getAnalytics);

// Get key metrics
router.get('/metrics', auth, getMetrics);

// Export analytics data
router.post('/export', auth, exportData);

// Download exported data (placeholder)
router.get('/download/:exportId', auth, (req, res) => {
  const { exportId } = req.params;
  
  // In a real implementation, serve the actual file
  res.json({
    success: true,
    message: 'Export download would start here',
    exportId,
    note: 'This is a placeholder endpoint. In production, this would serve the actual file.',
  });
});

export default router;
