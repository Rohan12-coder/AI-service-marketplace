import { Request, Response } from 'express';
import Review from '../models/Review';
import Booking from '../models/Booking';
import Notification from '../models/Notification';
import Provider from '../models/Provider';
import { sendSuccess, sendError, getPagination } from '../utils/helpers';

// ── Get Provider Reviews ──────────────────────────────────────────────────────
export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { sort = '-createdAt', minRating, page = 1, limit = 10 } = req.query;

    const filter: Record<string, unknown> = { provider: providerId, isVisible: true };
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const total    = await Review.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const reviews = await Review.find(filter)
      .populate('user', 'name avatar')
      .sort(sort as string)
      .skip(paginate.skip)
      .limit(paginate.limit);

    // Aggregate stats
    const stats = await Review.aggregate([
      { $match: { provider: { $eq: new (require('mongoose').Types.ObjectId)(providerId) }, isVisible: true } },
      {
        $group: {
          _id:           null,
          avgRating:     { $avg: '$rating' },
          totalReviews:  { $sum: 1 },
          avgQuality:    { $avg: '$subRatings.quality' },
          avgTimeliness: { $avg: '$subRatings.timeliness' },
          avgBehavior:   { $avg: '$subRatings.behavior' },
          fiveStar:      { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar:      { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar:     { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar:       { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar:       { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, { reviews, stats: stats[0] || {} }, 'Reviews fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Submit Review ─────────────────────────────────────────────────────────────
export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment, tags, subRatings, images } = req.body;

    if (!bookingId || !rating || !comment) {
      sendError(res, 'bookingId, rating and comment are required.', 400); return;
    }

    const booking = await Booking.findById(bookingId)
      .populate('provider', 'userId businessName');
    if (!booking) { sendError(res, 'Booking not found.', 404); return; }
    if (String(booking.user) !== req.userId) {
      sendError(res, 'You can only review your own bookings.', 403); return;
    }
    if (booking.status !== 'completed') {
      sendError(res, 'You can only review completed bookings.', 400); return;
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) { sendError(res, 'You have already reviewed this booking.', 409); return; }

    const review = await Review.create({
      user:       req.userId,
      provider:   booking.provider,
      booking:    bookingId,
      rating,
      comment,
      tags:       tags       || [],
      subRatings: subRatings || {},
      images:     images     || [],
      isVerified: true,
    });

    // Link review to booking
    await Booking.findByIdAndUpdate(bookingId, { reviewId: review._id });

    // Notify provider
    const providerDoc = booking.provider as unknown as { userId: string; businessName: string; _id: string };
    await Notification.create({
      user:    providerDoc.userId,
      type:    'review_received',
      title:   'New Review Received',
      message: `You received a ${rating}-star review!`,
      data:    { reviewId: String(review._id), bookingId },
      priority: rating <= 2 ? 'high' : 'low',
    });

    sendSuccess(res, review, 'Review submitted.', 201);
  } catch (err) {
    const error = err as Error & { code?: number };
    if (error.code === 11000) { sendError(res, 'Review already exists for this booking.', 409); return; }
    sendError(res, error.message, 500);
  }
};

// ── Update Review ─────────────────────────────────────────────────────────────
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) { sendError(res, 'Review not found.', 404); return; }
    if (String(review.user) !== req.userId) {
      sendError(res, 'Not authorised.', 403); return;
    }

    const allowed = ['rating', 'comment', 'tags', 'subRatings'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });
    sendSuccess(res, updated, 'Review updated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Delete Review ─────────────────────────────────────────────────────────────
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) { sendError(res, 'Review not found.', 404); return; }
    if (String(review.user) !== req.userId && req.userRole !== 'admin') {
      sendError(res, 'Not authorised.', 403); return;
    }
    await review.deleteOne();
    sendSuccess(res, null, 'Review deleted.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
