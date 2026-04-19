import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Provider from '../models/Provider';
import Booking from '../models/Booking';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPagination } from '../utils/helpers';

// ── Get Profile ───────────────────────────────────────────────────────────────
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .populate('savedProviders', 'businessName rating coverImage location category');
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, user, 'Profile fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const allowed = ['name', 'phone', 'location', 'notificationPreferences'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true, runValidators: true,
    });
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, user, 'Profile updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Update Avatar ─────────────────────────────────────────────────────────────
export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { avatar } = req.body;
    if (!avatar) { sendError(res, 'No avatar uploaded.', 400); return; }

    const user = await User.findByIdAndUpdate(
      req.userId, { avatar }, { new: true }
    );
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, { avatar: user.avatar }, 'Avatar updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get User Bookings ─────────────────────────────────────────────────────────
export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter: Record<string, unknown> = { user: req.userId };
    if (status) filter.status = status;

    const total    = await Booking.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const bookings = await Booking.find(filter)
      .populate('provider', 'businessName coverImage rating')
      .populate('service', 'title pricing')
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, bookings, 'Bookings fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Saved Providers ───────────────────────────────────────────────────────
export const getSavedProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path:     'savedProviders',
        populate: { path: 'category', select: 'name icon' },
        select:   'businessName rating coverImage location category isOnline',
      });
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, user.savedProviders, 'Saved providers fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Save Provider ─────────────────────────────────────────────────────────────
export const saveProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      sendError(res, 'Invalid provider ID.', 400); return;
    }

    const provider = await Provider.findById(providerId);
    if (!provider) { sendError(res, 'Provider not found.', 404); return; }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { savedProviders: providerId } },
      { new: true }
    );
    sendSuccess(res, { savedProviders: user?.savedProviders }, 'Provider saved.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Unsave Provider ───────────────────────────────────────────────────────────
export const unsaveProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { savedProviders: providerId } },
      { new: true }
    );
    sendSuccess(res, { savedProviders: user?.savedProviders }, 'Provider removed from saved.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Notifications ─────────────────────────────────────────────────────────
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter: Record<string, unknown> = { user: req.userId };
    if (unreadOnly === 'true') filter.isRead = false;

    const total    = await Notification.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit);

    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false });
    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, { notifications, unreadCount }, 'Notifications fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Mark Notification Read ────────────────────────────────────────────────────
export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) { sendError(res, 'Notification not found.', 404); return; }
    sendSuccess(res, notification, 'Notification marked as read.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
