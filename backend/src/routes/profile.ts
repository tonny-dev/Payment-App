import express from 'express';
import { auth } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  updatePreferences,
  updateSecuritySettings,
  uploadAvatar,
  exportUserData,
  deleteAccount,
} from '../controllers/profileController';

const router = express.Router();

// Get user profile
router.get('/', auth, getProfile);

// Update user profile
router.put('/', auth, updateProfile);

// Update user preferences
router.put('/preferences', auth, updatePreferences);

// Update security settings
router.put('/security', auth, updateSecuritySettings);

// Upload avatar
router.post('/avatar', auth, uploadAvatar);

// Export user data
router.post('/export', auth, exportUserData);

// Download user data export (placeholder)
router.get('/download-export/:userId', auth, (req, res) => {
  const { userId } = req.params;
  
  // In a real implementation, serve the actual export file
  res.json({
    success: true,
    message: 'User data export download would start here',
    userId,
    note: 'This is a placeholder endpoint. In production, this would serve the actual export file.',
  });
});

// Delete user account
router.delete('/account', auth, deleteAccount);

export default router;
