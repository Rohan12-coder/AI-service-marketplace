import { Router } from 'express';
import {
  getProfile, updateProfile, updateAvatar,
  getUserBookings, getSavedProviders,
  saveProvider, unsaveProvider,
  getNotifications, markNotificationRead,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadSingle, processAvatar } from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// All user routes are protected
router.use(protect);

router.get('/profile',                               getProfile);
router.put('/profile',                               updateProfile);
router.put('/avatar', uploadLimiter, uploadSingle('avatar'), processAvatar, updateAvatar);
router.get('/bookings',                              getUserBookings);
router.get('/saved-providers',                       getSavedProviders);
router.post('/saved-providers/:providerId',          saveProvider);
router.delete('/saved-providers/:providerId',        unsaveProvider);
router.get('/notifications',                         getNotifications);
router.put('/notifications/:id/read',                markNotificationRead);

export default router;
