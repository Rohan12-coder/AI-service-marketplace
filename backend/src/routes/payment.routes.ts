import { Router } from 'express';
import {
  createOrder, verifyPayment, getPaymentHistory, processRefund,
} from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify',       verifyPayment);
router.get('/history',       getPaymentHistory);
router.post('/refund/:id',   processRefund);

export default router;
