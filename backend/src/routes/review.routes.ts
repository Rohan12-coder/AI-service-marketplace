import { Router } from 'express';
import {
  getProviderReviews, submitReview, updateReview, deleteReview,
} from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/provider/:providerId',  getProviderReviews);
router.post('/',     protect,        submitReview);
router.put('/:id',   protect,        updateReview);
router.delete('/:id', protect,       deleteReview);

export default router;
