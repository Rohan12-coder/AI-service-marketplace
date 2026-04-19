import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Provider from '../models/Provider';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import { sendSuccess, sendError, getPagination, calculateDistance } from '../utils/helpers';

// ── List Providers with filters ───────────────────────────────────────────────
export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category, minRating, emergency, city,
      sort = '-rating.average', page = 1, limit = 12, q,
    } = req.query;

    const filter: Record<string, unknown> = { isApproved: true };
    if (category)  filter.category = category;
    if (emergency === 'true') filter.isEmergencyAvailable = true;
    if (city)      filter['location.city'] = new RegExp(String(city), 'i');
    if (minRating) filter['rating.average'] = { $gte: Number(minRating) };
    if (q) {
      filter.$or = [
        { businessName: new RegExp(String(q), 'i') },
        { description:  new RegExp(String(q), 'i') },
        { tags:         new RegExp(String(q), 'i') },
      ];
    }

    const total    = await Provider.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const providers = await Provider.find(filter)
      .populate('userId',   'name avatar')
      .populate('category', 'name icon color')
      .sort(sort as string)
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, providers, 'Providers fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Single Provider ───────────────────────────────────────────────────────
export const getProviderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { sendError(res, 'Invalid ID.', 400); return; }

    const provider = await Provider.findById(id)
      .populate('userId',   'name avatar email phone')
      .populate('category', 'name icon slug color')
      .populate('services', 'title pricing duration images isActive');

    if (!provider) { sendError(res, 'Provider not found.', 404); return; }
    sendSuccess(res, provider, 'Provider fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Create Provider Profile ───────────────────────────────────────────────────
export const createProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Provider.findOne({ userId: req.userId });
    if (existing) { sendError(res, 'Provider profile already exists.', 409); return; }

    const provider = await Provider.create({ ...req.body, userId: req.userId });
    sendSuccess(res, provider, 'Provider profile created.', 201);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Update Provider Profile ───────────────────────────────────────────────────
export const updateProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const provider = await Provider.findById(id);
    if (!provider) { sendError(res, 'Provider not found.', 404); return; }

    // Only owner or admin can update
    if (String(provider.userId) !== req.userId && req.userRole !== 'admin') {
      sendError(res, 'Not authorised to update this profile.', 403); return;
    }

    // Recalculate profile completion score
    const body = req.body;
    let score = 0;
    if (body.businessName || provider.businessName) score += 15;
    if (body.description  || provider.description)  score += 15;
    if (body.category     || provider.category)      score += 10;
    if ((body.portfolio   || provider.portfolio)?.length > 0) score += 20;
    if ((body.services    || provider.services)?.length > 0)  score += 20;
    if (body.location?.address || provider.location?.address) score += 10;
    if (body.pricing?.min || provider.pricing?.min)  score += 10;
    body.profileCompletionScore = score;

    const updated = await Provider.findByIdAndUpdate(id, body, {
      new: true, runValidators: true,
    });
    sendSuccess(res, updated, 'Provider profile updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Nearby Providers ──────────────────────────────────────────────────────
export const getNearbyProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = 20, category, limit = 10 } = req.query;
    if (!lat || !lng) { sendError(res, 'lat and lng query params are required.', 400); return; }

    const userLat = parseFloat(String(lat));
    const userLng = parseFloat(String(lng));
    const maxKm   = parseFloat(String(radius));

    const filter: Record<string, unknown> = { isApproved: true };
    if (category) filter.category = category;

    const all = await Provider.find(filter)
      .populate('userId',   'name avatar')
      .populate('category', 'name icon')
      .limit(200);

    const nearby = all
      .map((p) => {
        const dist = calculateDistance(userLat, userLng, p.location.lat, p.location.lng);
        return { ...p.toObject(), distance: dist };
      })
      .filter((p) => p.distance <= maxKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Number(limit));

    sendSuccess(res, nearby, `${nearby.length} providers found nearby.`);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Update Availability ───────────────────────────────────────────────────────
export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { days, timeSlots, isAvailableNow } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      id,
      { availability: { days, timeSlots, isAvailableNow } },
      { new: true, runValidators: true }
    );
    if (!provider) { sendError(res, 'Provider not found.', 404); return; }
    sendSuccess(res, provider.availability, 'Availability updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Provider's Bookings ───────────────────────────────────────────────────
export const getProviderBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter: Record<string, unknown> = { provider: id };
    if (status) filter.status = status;

    const total    = await Booking.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const bookings = await Booking.find(filter)
      .populate('user',    'name avatar phone')
      .populate('service', 'title pricing')
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, bookings, 'Bookings fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Provider Analytics ────────────────────────────────────────────────────────
export const getProviderAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const providerId = new mongoose.Types.ObjectId(id);

    const [bookingStats, revenueStats, ratingTrend] = await Promise.all([
      Booking.aggregate([
        { $match: { provider: providerId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { provider: providerId, status: 'captured' } },
        {
          $group: {
            _id:           { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalRevenue:  { $sum: '$amountInRupees' },
            count:         { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      Booking.aggregate([
        { $match: { provider: providerId, status: 'completed' } },
        { $group: { _id: null, completed: { $sum: 1 }, total: { $sum: 1 } } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of bookingStats) statusMap[s._id] = s.count;

    sendSuccess(res, {
      bookingsByStatus: statusMap,
      revenueByDay:     revenueStats,
      completionRate:   ratingTrend[0] || { completed: 0, total: 0 },
      totalEarnings:    revenueStats.reduce((a: number, b: { totalRevenue: number }) => a + b.totalRevenue, 0),
    }, 'Analytics fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
