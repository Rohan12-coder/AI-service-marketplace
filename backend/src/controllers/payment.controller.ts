import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPagination, generateReceiptId, calculateCommission } from '../utils/helpers';
import { sendEmail, templates } from '../utils/email';
import User from '../models/User';
import env from '../config/env';

const getRazorpay = () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured.');
  }
  return new Razorpay({
    key_id:     env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
};

// ── Create Razorpay Order ─────────────────────────────────────────────────────
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) { sendError(res, 'bookingId is required.', 400); return; }

    const booking = await Booking.findById(bookingId)
      .populate('provider', '_id');
    if (!booking) { sendError(res, 'Booking not found.', 404); return; }
    if (String(booking.user) !== req.userId) {
      sendError(res, 'Not authorised.', 403); return;
    }
    if (booking.paymentStatus === 'paid') {
      sendError(res, 'Booking already paid.', 400); return;
    }

    const razorpay   = getRazorpay();
    const amountPaise = Math.round(booking.amount * 100); // convert to paise
    const receipt    = generateReceiptId();

    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        bookingId: bookingId,
        userId:    req.userId || '',
      },
    });

    const { commission, providerPayout } = calculateCommission(booking.amount);

    const payment = await Payment.create({
      user:            req.userId,
      provider:        booking.provider,
      booking:         bookingId,
      razorpayOrderId: order.id,
      amount:          amountPaise,
      amountInRupees:  booking.amount,
      currency:        'INR',
      status:          'created',
      receipt,
      description:     `Booking #${bookingId}`,
      platformFee:     commission,
      providerPayout,
      isEmergencyBooking: booking.isEmergency,
      notes: { bookingId, receipt },
    });

    sendSuccess(res, {
      orderId:   order.id,
      amount:    amountPaise,
      currency:  'INR',
      receipt,
      paymentId: String(payment._id),
      keyId:     env.RAZORPAY_KEY_ID,
    }, 'Order created.');
  } catch (err) {
    const error = err as Error;
    if (error.message.includes('Razorpay')) {
      sendError(res, 'Payment service unavailable.', 503); return;
    }
    sendError(res, error.message, 500);
  }
};

// ── Verify Payment ────────────────────────────────────────────────────────────
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      sendError(res, 'Payment verification data is incomplete.', 400); return;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      sendError(res, 'Payment verification failed. Invalid signature.', 400); return;
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status:            'captured',
      },
      { new: true }
    );

    if (!payment) { sendError(res, 'Payment record not found.', 404); return; }

    // Update booking payment status
    await Booking.findByIdAndUpdate(bookingId || payment.booking, {
      paymentStatus: 'paid',
      paymentId:     razorpay_payment_id,
    });

    // Notify user
    const user = await User.findById(req.userId);
    if (user) {
      await Notification.create({
        user:    req.userId,
        type:    'payment_success',
        title:   'Payment Successful',
        message: `Payment of ₹${payment.amountInRupees} received.`,
        data:    { paymentId: String(payment._id), amount: payment.amountInRupees },
      });

      sendEmail({
        to:      user.email,
        subject: 'Payment Confirmed — Smart Service Marketplace',
        html:    templates.paymentSuccess(
          user.name,
          String(payment.amountInRupees),
          `Booking #${String(payment.booking)}`,
          razorpay_payment_id
        ),
      });
    }

    sendSuccess(res, {
      verified:          true,
      razorpayPaymentId: razorpay_payment_id,
      amount:            payment.amountInRupees,
    }, 'Payment verified successfully.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Payment History ───────────────────────────────────────────────────────────
export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter: Record<string, unknown> = { user: req.userId };

    const total    = await Payment.countDocuments(filter);
    const paginate = getPagination({ page: Number(page), limit: Number(limit) }, total);

    const payments = await Payment.find(filter)
      .populate('booking', 'date timeSlot status')
      .populate('provider', 'businessName')
      .sort({ createdAt: -1 })
      .skip(paginate.skip)
      .limit(paginate.limit);

    const { skip: _skip, ...paginationMeta } = paginate;
    sendSuccess(res, payments, 'Payment history fetched.', 200, paginationMeta);
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Process Refund ────────────────────────────────────────────────────────────
export const processRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) { sendError(res, 'Payment not found.', 404); return; }
    if (String(payment.user) !== req.userId && req.userRole !== 'admin') {
      sendError(res, 'Not authorised.', 403); return;
    }
    if (payment.status !== 'captured') {
      sendError(res, 'Only captured payments can be refunded.', 400); return;
    }
    if (payment.refund) {
      sendError(res, 'Refund already processed.', 400); return;
    }

    const razorpay = getRazorpay();
    const refund   = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount, // full refund
      notes:  { reason: reason || 'Customer requested refund' },
    });

    await Payment.findByIdAndUpdate(id, {
      status: 'refunded',
      refund: {
        razorpayRefundId: refund.id,
        amount:           payment.amountInRupees,
        status:           'processed',
        reason:           reason || 'Customer requested refund',
        processedAt:      new Date(),
      },
    });

    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'refunded' });

    await Notification.create({
      user:    payment.user,
      type:    'payment_refunded',
      title:   'Refund Processed',
      message: `Your refund of ₹${payment.amountInRupees} is being processed.`,
      data:    { paymentId: id, amount: payment.amountInRupees },
    });

    sendSuccess(res, { refundId: refund.id, amount: payment.amountInRupees }, 'Refund initiated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
