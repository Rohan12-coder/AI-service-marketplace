import { Router } from 'express';
import {
  getBookings, createBooking, getBookingById,
  updateBookingStatus, cancelBooking, rescheduleBooking, deleteBooking,
} from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/',              getBookings);
router.post('/',             createBooking);
router.get('/:id',           getBookingById);
router.put('/:id/status',    updateBookingStatus);
router.put('/:id/cancel',    cancelBooking);
router.put('/:id/reschedule', rescheduleBooking);
router.delete('/:id',        deleteBooking);

export default router;
