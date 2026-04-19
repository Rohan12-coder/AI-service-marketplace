import { Router } from 'express';
import {
  getProviders, getProviderById, createProvider,
  updateProvider, getNearbyProviders,
  updateAvailability, getProviderBookings, getProviderAnalytics,
} from '../controllers/provider.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';

const router = Router();

router.get('/',              getProviders);
router.get('/nearby',        getNearbyProviders);
router.get('/:id',           getProviderById);
router.post('/',             protect, restrictTo('provider', 'admin'), createProvider);
router.put('/:id',           protect, restrictTo('provider', 'admin'), updateProvider);
router.put('/:id/availability', protect, restrictTo('provider', 'admin'), updateAvailability);
router.get('/:id/bookings',  protect, restrictTo('provider', 'admin'), getProviderBookings);
router.get('/:id/analytics', protect, restrictTo('provider', 'admin'), getProviderAnalytics);

export default router;
