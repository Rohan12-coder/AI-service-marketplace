import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Provider from '../models/Provider';
import Service from '../models/Service';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPagination, calculateEmergencyFee } from '../utils/helpers';
import { sendEmail, templates } from '../utils/email';
import User from '../models/User';

// ── Get All Bookings (role-aware) ─────────────────────────────────────────────
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter: Record<string, unknown> = {};

    if (req.userRole === 'user')     filter.user     = req.userId;
    if (req.userRole === 'provider') {
      const provider = await Provider.findOne({ userId: req.userId });
      if (provider) filter.provider = provider._id;
    }
    if (status) filter.status = status;

    const total    = await Booking.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const bookings = await Booking.find(filter)
      .populate('user',     'name avatar phone')
      .populate('provider', 'businessName coverImage')
      .populate('service',  'title pricing duration')
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, bookings, 'Bookings fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Create Booking ────────────────────────────────────────────────────────────
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId, serviceId, date, timeSlot, address, notes, isEmergency } = req.body;

    if (!providerId || !serviceId || !date || !timeSlot || !address) {
      sendError(res, 'providerId, serviceId, date, timeSlot and address are required.', 400);
      return;
    }

    const [provider, service] = await Promise.all([
      Provider.findById(providerId).populate('userId', 'name email'),
      Service.findById(serviceId),
    ]);

    if (!provider) { sendError(res, 'Provider not found.', 404); return; }
    if (!service)  { sendError(res, 'Service not found.', 404); return; }
    if (!provider.isApproved) { sendError(res, 'Provider is not approved.', 400); return; }

    const baseAmount  = service.pricing.amount;
    const finalAmount = isEmergency ? calculateEmergencyFee(baseAmount) : baseAmount;

    const booking = await Booking.create({
      user:      req.userId,
      provider:  providerId,
      service:   serviceId,
      date:      new Date(date as string),
      timeSlot,
      address,
      notes:     notes || '',
      amount:    finalAmount,
      isEmergency: Boolean(isEmergency),
      emergencyFeeApplied: Boolean(isEmergency),
    });

    // Notify provider
    const providerUser = provider.userId as unknown as { name: string; email: string };
    const user = await User.findById(req.userId);

    await Notification.create({
      user:    provider.userId,
      type:    'booking_created',
      title:   'New Booking Request',
      message: `${user?.name || 'A customer'} has booked ${service.title}`,
      data:    { bookingId: String(booking._id), serviceId, actionUrl: `/dashboard/provider` },
      priority: isEmergency ? 'high' : 'medium',
    });

    sendEmail({
      to:      providerUser.email,
      subject: isEmergency ? '🚨 Emergency Booking Request!' : 'New Booking Request',
      html:    templates.newBookingRequest(
        provider.businessName,
        service.title,
        user?.name || 'Customer',
        new Date(date as string).toLocaleDateString('en-IN'),
        timeSlot as string,
        String(booking._id)
      ),
    });

    // Notify user
    if (user) {
      await Notification.create({
        user:    req.userId,
        type:    'booking_created',
        title:   'Booking Placed',
        message: `Your booking for ${service.title} has been placed successfully.`,
        data:    { bookingId: String(booking._id) },
      });

      sendEmail({
        to:      user.email,
        subject: 'Booking Confirmed — Smart Service Marketplace',
        html:    templates.bookingConfirmation(
          user.name, service.title, provider.businessName,
          new Date(date as string).toLocaleDateString('en-IN'),
          timeSlot as string, String(finalAmount), String(booking._id)
        ),
      });
    }

    const populated = await Booking.findById(booking._id)
      .populate('provider', 'businessName')
      .populate('service',  'title pricing');

    sendSuccess(res, populated, 'Booking created.', 201);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Get Single Booking ────────────────────────────────────────────────────────
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user',     'name avatar phone email')
      .populate('provider', 'businessName coverImage location rating')
      .populate('service',  'title description pricing duration images');

    if (!booking) { sendError(res, 'Booking not found.', 404); return; }

    // Auth check: only user, provider, or admin can view
    const isOwner    = String(booking.user)     === req.userId;
    const isProvider = req.userRole === 'provider';
    const isAdmin    = req.userRole === 'admin';
    if (!isOwner && !isProvider && !isAdmin) {
      sendError(res, 'Not authorised.', 403); return;
    }

    sendSuccess(res, booking, 'Booking fetched.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Update Booking Status ─────────────────────────────────────────────────────
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const validTransitions: Record<string, string[]> = {
      pending:     ['accepted', 'rejected'],
      accepted:    ['in-progress', 'cancelled'],
      'in-progress': ['completed'],
    };

    const booking = await Booking.findById(id)
      .populate('user',    'name email')
      .populate('service', 'title');

    if (!booking) { sendError(res, 'Booking not found.', 404); return; }

    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(status)) {
      sendError(res, `Cannot transition from '${booking.status}' to '${status}'.`, 400);
      return;
    }

    const updates: Record<string, unknown> = { status };
    if (status === 'accepted')   updates.acceptedAt  = new Date();
    if (status === 'completed')  updates.completedAt = new Date();
    if (status === 'rejected')   updates.rejectionReason = rejectionReason || 'Provider declined';

    const updated = await Booking.findByIdAndUpdate(id, updates, { new: true });

    // Notify user
    const userDoc    = booking.user    as unknown as { name: string; email: string; _id: string };
    const serviceDoc = booking.service as unknown as { title: string };

    const messages: Record<string, string> = {
      accepted:     `Your booking for ${serviceDoc.title} has been accepted! The provider will arrive at the scheduled time.`,
      rejected:     `Your booking for ${serviceDoc.title} was declined. ${rejectionReason || ''}`,
      'in-progress': `Your service ${serviceDoc.title} is now in progress.`,
      completed:    `Your service ${serviceDoc.title} has been completed. Please leave a review!`,
    };

    await Notification.create({
      user:    userDoc._id,
      type:    `booking_${status}` as 'booking_accepted' | 'booking_rejected' | 'booking_completed',
      title:   `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: messages[status] || `Booking status updated to ${status}`,
      data:    { bookingId: id },
      priority: status === 'rejected' ? 'high' : 'medium',
    });

    if (messages[status]) {
      sendEmail({
        to:      userDoc.email,
        subject: `Booking Update: ${status.toUpperCase()}`,
        html:    templates.bookingStatusUpdate(
          userDoc.name, id, serviceDoc.title, status, messages[status]
        ),
      });
    }

    // Update provider completed jobs count
    if (status === 'completed') {
      await Provider.findByIdAndUpdate(booking.provider, { $inc: { completedJobs: 1 } });
    }

    sendSuccess(res, updated, `Booking ${status}.`);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Cancel Booking ────────────────────────────────────────────────────────────
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) { sendError(res, 'Booking not found.', 404); return; }
    if (!['pending', 'accepted'].includes(booking.status)) {
      sendError(res, 'Only pending or accepted bookings can be cancelled.', 400); return;
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancellationReason: req.body.reason || 'Cancelled by user' },
      { new: true }
    );
    sendSuccess(res, updated, 'Booking cancelled.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Reschedule Booking ────────────────────────────────────────────────────────
export const rescheduleBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, timeSlot, reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) { sendError(res, 'Booking not found.', 404); return; }
    if (!['pending', 'accepted'].includes(booking.status)) {
      sendError(res, 'Only pending or accepted bookings can be rescheduled.', 400); return;
    }

    const log = {
      previousDate:     booking.date,
      previousTimeSlot: booking.timeSlot,
      reason:           reason || '',
      rescheduledAt:    new Date(),
    };

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        date:     new Date(date),
        timeSlot,
        status:   'pending',
        $push:    { rescheduleLog: log },
      },
      { new: true }
    );
    sendSuccess(res, updated, 'Booking rescheduled.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Delete Booking ────────────────────────────────────────────────────────────
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) { sendError(res, 'Booking not found.', 404); return; }
    if (booking.status !== 'cancelled') {
      sendError(res, 'Only cancelled bookings can be deleted.', 400); return;
    }
    if (String(booking.user) !== req.userId && req.userRole !== 'admin') {
      sendError(res, 'Not authorised.', 403); return;
    }
    await Booking.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 'Booking deleted.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
