import { Router } from 'express';
import {
  getServices, getServiceById, createService,
  updateService, deleteService, getFeaturedServices, getCategories,
} from '../controllers/service.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',            optionalAuth, getServices);
router.get('/featured',               getFeaturedServices);
router.get('/categories',             getCategories);
router.get('/:id',         optionalAuth, getServiceById);
router.post('/',           protect, restrictTo('provider', 'admin'), createService);
router.put('/:id',         protect, restrictTo('provider', 'admin'), updateService);
router.delete('/:id',      protect, restrictTo('provider', 'admin'), deleteService);

export default router;
