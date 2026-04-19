import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Service from '../models/Service';
import Category from '../models/Category';
import Provider from '../models/Provider';
import { sendSuccess, sendError, getPagination } from '../utils/helpers';

// ── Search / List Services ────────────────────────────────────────────────────
export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q, category, minPrice, maxPrice,
      minRating, emergency, sort = '-createdAt',
      page = 1, limit = 12,
    } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;
    if (emergency === 'true') filter.isEmergencyAvailable = true;
    if (minPrice || maxPrice) {
      filter['pricing.amount'] = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      };
    }
    if (minRating) filter['rating.average'] = { $gte: Number(minRating) };
    if (q) filter.$text = { $search: String(q) };

    const total    = await Service.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const services = await Service.find(filter)
      .populate('provider',  'businessName rating coverImage location isOnline')
      .populate('category',  'name icon color')
      .sort(sort as string)
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, services, 'Services fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Single Service ────────────────────────────────────────────────────────
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { sendError(res, 'Invalid ID.', 400); return; }

    const service = await Service.findById(id)
      .populate({
        path:     'provider',
        populate: { path: 'userId category', select: 'name avatar email name icon color' },
      })
      .populate('category', 'name icon slug');

    if (!service) { sendError(res, 'Service not found.', 404); return; }

    // Increment view count
    await Service.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    sendSuccess(res, service, 'Service fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Create Service ────────────────────────────────────────────────────────────
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const provider = await Provider.findOne({ userId: req.userId });
    if (!provider) { sendError(res, 'Provider profile not found. Create one first.', 404); return; }
    if (!provider.isApproved) { sendError(res, 'Your provider account is pending approval.', 403); return; }

    const service = await Service.create({ ...req.body, provider: provider._id });

    // Link service to provider
    await Provider.findByIdAndUpdate(provider._id, {
      $addToSet: { services: service._id },
    });

    // Update category service count
    await Category.findByIdAndUpdate(service.category, { $inc: { serviceCount: 1 } });

    sendSuccess(res, service, 'Service created.', 201);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Update Service ────────────────────────────────────────────────────────────
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate('provider', 'userId');
    if (!service) { sendError(res, 'Service not found.', 404); return; }

    const providerDoc = service.provider as unknown as { userId: mongoose.Types.ObjectId };
    if (String(providerDoc.userId) !== req.userId && req.userRole !== 'admin') {
      sendError(res, 'Not authorised.', 403); return;
    }

    const updated = await Service.findByIdAndUpdate(id, req.body, {
      new: true, runValidators: true,
    });
    sendSuccess(res, updated, 'Service updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Delete Service ────────────────────────────────────────────────────────────
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate('provider', 'userId');
    if (!service) { sendError(res, 'Service not found.', 404); return; }

    const providerDoc = service.provider as unknown as { _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId };
    if (String(providerDoc.userId) !== req.userId && req.userRole !== 'admin') {
      sendError(res, 'Not authorised.', 403); return;
    }

    await Service.findByIdAndDelete(id);
    await Provider.findByIdAndUpdate(providerDoc._id, { $pull: { services: id } });
    await Category.findByIdAndUpdate(service.category, { $inc: { serviceCount: -1 } });

    sendSuccess(res, null, 'Service deleted.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Featured Services ─────────────────────────────────────────────────────────
export const getFeaturedServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ isActive: true, isFeatured: true })
      .populate('provider', 'businessName rating coverImage location')
      .populate('category', 'name icon')
      .sort('-rating.average')
      .limit(8);
    sendSuccess(res, services, 'Featured services fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Categories ────────────────────────────────────────────────────────────
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    sendSuccess(res, categories, 'Categories fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
