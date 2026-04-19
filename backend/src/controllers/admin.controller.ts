import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Provider from '../models/Provider';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import Category from '../models/Category';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPagination } from '../utils/helpers';
import { sendEmail, templates } from '../utils/email';

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers, totalProviders, totalBookings,
      pendingApprovals, activeBookings, totalRevenue,
      recentUsers, recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Provider.countDocuments({ isApproved: true }),
      Booking.countDocuments(),
      Provider.countDocuments({ isApproved: false }),
      Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'in-progress'] } }),
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, total: { $sum: '$amountInRupees' } } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt avatar'),
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate('user', 'name')
        .populate('service', 'title'),
    ]);

    sendSuccess(res, {
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        pendingApprovals,
        activeBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentUsers,
      recentBookings,
    }, 'Dashboard data fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      revenueByDay, bookingsByCategory, userGrowth,
      bookingsByStatus, topProviders,
    ] = await Promise.all([
      // Revenue last 30 days
      Payment.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id:     { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amountInRupees' },
            count:   { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Bookings by category
      Booking.aggregate([
        {
          $lookup: {
            from:         'services',
            localField:   'service',
            foreignField: '_id',
            as:           'serviceData',
          },
        },
        { $unwind: '$serviceData' },
        {
          $lookup: {
            from:         'categories',
            localField:   'serviceData.category',
            foreignField: '_id',
            as:           'categoryData',
          },
        },
        { $unwind: '$categoryData' },
        {
          $group: {
            _id:   '$categoryData.name',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // User growth last 30 days
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Bookings by status
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Top providers by earnings
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: '$provider', totalEarnings: { $sum: '$providerPayout' }, bookings: { $sum: 1 } } },
        { $sort: { totalEarnings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from:         'providers',
            localField:   '_id',
            foreignField: '_id',
            as:           'providerData',
          },
        },
        { $unwind: '$providerData' },
        {
          $project: {
            businessName:  '$providerData.businessName',
            totalEarnings: 1,
            bookings:      1,
            rating:        '$providerData.rating',
          },
        },
      ]),
    ]);

    sendSuccess(res, {
      revenueByDay,
      bookingsByCategory,
      userGrowth,
      bookingsByStatus,
      topProviders,
    }, 'Analytics fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get All Users ─────────────────────────────────────────────────────────────
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, isActive, page = 1, limit = 20, q } = req.query;
    const filter: Record<string, unknown> = {};
    if (role)     filter.role     = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (q) {
      filter.$or = [
        { name:  new RegExp(String(q), 'i') },
        { email: new RegExp(String(q), 'i') },
      ];
    }

    const total    = await User.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, users, 'Users fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Update User Status ────────────────────────────────────────────────────────
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id }      = req.params;
    const { isActive, role } = req.body;

    const updates: Record<string, unknown> = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role)                   updates.role     = role;

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select('-password');
    if (!user) { sendError(res, 'User not found.', 404); return; }

    sendSuccess(res, user, 'User updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Delete User ───────────────────────────────────────────────────────────────
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, null, 'User deleted.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get All Providers (for admin) ─────────────────────────────────────────────
export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isApproved, page = 1, limit = 20, q } = req.query;
    const filter: Record<string, unknown> = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (q) filter.$or = [{ businessName: new RegExp(String(q), 'i') }];

    const total    = await Provider.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const providers = await Provider.find(filter)
      .populate('userId',   'name email phone avatar')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, providers, 'Providers fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Approve / Reject Provider ─────────────────────────────────────────────────
export const approveProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id }       = req.params;
    const { isApproved, rejectionReason } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    ).populate('userId', 'name email');

    if (!provider) { sendError(res, 'Provider not found.', 404); return; }

    const userDoc = provider.userId as unknown as { name: string; email: string; _id: string };

    // Notify provider
    await Notification.create({
      user:    userDoc._id,
      type:    isApproved ? 'provider_approved' : 'provider_rejected',
      title:   isApproved ? 'Account Approved!' : 'Account Not Approved',
      message: isApproved
        ? 'Your provider account has been approved. You can now receive bookings!'
        : `Your provider account was not approved. Reason: ${rejectionReason || 'Did not meet requirements'}`,
      data:    { providerId: id },
      priority: 'high',
    });

    if (isApproved) {
      sendEmail({
        to:      userDoc.email,
        subject: '🎊 Your Provider Account is Approved!',
        html:    templates.providerApproved(provider.businessName),
      });
    }

    sendSuccess(res, provider, `Provider ${isApproved ? 'approved' : 'rejected'}.`);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get All Bookings (admin view) ─────────────────────────────────────────────
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total    = await Booking.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const bookings = await Booking.find(filter)
      .populate('user',     'name email')
      .populate('provider', 'businessName')
      .populate('service',  'title pricing')
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, bookings, 'Bookings fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Categories CRUD ───────────────────────────────────────────────────────────
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort('order');
    sendSuccess(res, categories, 'Categories fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    sendSuccess(res, category, 'Category created.', 201);
  } catch (err) {
    const error = err as Error & { code?: number };
    if (error.code === 11000) { sendError(res, 'Category already exists.', 409); return; }
    sendError(res, error.message, 500);
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!category) { sendError(res, 'Category not found.', 404); return; }
    sendSuccess(res, category, 'Category updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) { sendError(res, 'Category not found.', 404); return; }
    sendSuccess(res, null, 'Category deleted.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
