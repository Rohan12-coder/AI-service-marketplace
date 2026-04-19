import { Router } from 'express';
import {
  getNotifications, markAllRead, deleteNotification,
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/',          getNotifications);
router.put('/read-all',  markAllRead);
router.delete('/:id',    deleteNotification);

export default router;
