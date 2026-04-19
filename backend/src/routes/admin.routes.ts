import { Router } from 'express';
import {
  getDashboard, getUsers, updateUserStatus, deleteUser,
  getProviders, approveProvider, getBookings,
  getCategories, createCategory, updateCategory, deleteCategory,
  getAnalytics,
} from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/role.middleware';

const router = Router();

router.use(protect, adminOnly);

router.get('/dashboard',                getDashboard);
router.get('/analytics',                getAnalytics);
router.get('/users',                    getUsers);
router.put('/users/:id/status',         updateUserStatus);
router.delete('/users/:id',             deleteUser);
router.get('/providers',                getProviders);
router.put('/providers/:id/approve',    approveProvider);
router.get('/bookings',                 getBookings);
router.get('/categories',               getCategories);
router.post('/categories',              createCategory);
router.put('/categories/:id',           updateCategory);
router.delete('/categories/:id',        deleteCategory);

export default router;
