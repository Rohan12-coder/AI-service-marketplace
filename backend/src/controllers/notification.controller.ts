import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPagination } from '../utils/helpers';

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

    const unreadCount = await Notification.countDocuments({
      user:   req.userId,
      isRead: false,
    });

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(
      res,
      { notifications, unreadCount },
      'Notifications fetched.',
      200,
      paginationMeta
    );
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Mark All Read ─────────────────────────────────────────────────────────────
export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );
    sendSuccess(res, null, 'All notifications marked as read.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Delete Notification ───────────────────────────────────────────────────────
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id:  req.params.id,
      user: req.userId,
    });
    if (!notification) { sendError(res, 'Notification not found.', 404); return; }
    sendSuccess(res, null, 'Notification deleted.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
