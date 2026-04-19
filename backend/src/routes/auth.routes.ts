import { Router } from 'express';
import {
  register, login, logout,
  forgotPassword, resetPassword,
  getMe, changePassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register',              authLimiter,          register);
router.post('/login',                 authLimiter,          login);
router.post('/logout',                protect,              logout);
router.post('/forgot-password',       passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token',                       resetPassword);
router.get('/me',                     protect,              getMe);
router.put('/change-password',        protect,              changePassword);

export default router;
