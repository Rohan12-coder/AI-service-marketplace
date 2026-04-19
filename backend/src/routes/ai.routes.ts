import { Router } from 'express';
import {
  chat, naturalLanguageSearch, recommendProviders,
  summarizeReviews, analyzeImage,
} from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';
import { optionalAuth } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rateLimiter.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

router.use(aiLimiter);

router.post('/chat',             optionalAuth, chat);
router.post('/search',           optionalAuth, naturalLanguageSearch);
router.post('/recommend',        protect,      recommendProviders);
router.post('/summarize-reviews',optionalAuth, summarizeReviews);
router.post('/analyze-image',    protect, uploadSingle('image'), analyzeImage);

export default router;
