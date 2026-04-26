'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Clock, MapPin, CreditCard,
  CheckCircle, XCircle, AlertCircle, FileText, Star,
} from 'lucide-react';
import { bookingAPI, paymentAPI, reviewAPI } from '@/lib/api';
import { IBooking, IService, IProvider } from '@/types';
import {
  formatPrice, formatDate, formatDateTime, getAvatarUrl,
  getBookingStatusLabel, getBookingStatusColor, cn,
  loadRazorpayScript,
} from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { useNotification } from '@/context/NotificationContext';
import BookingStatusComp from '@/components/booking/BookingStatus';
import { PageLoader } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const { success, error: notifyError } = useNotification();

  const [booking, setBooking]       = useState<IBooking | null>(null);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Review state
  const [showReview, setShowReview]   = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadBooking = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await bookingAPI.getById(id);
      setBooking(res.data.data);
    } catch {
      notifyError('Error', 'Could not load booking details.');
      router.push('/booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) loadBooking();
  }, [user, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) return <PageLoader />;
  if (!user) return null;
  if (loading) return <PageLoader message="Loading booking..." />;
  if (!booking) return null;

  const service  = booking.service  as IService;
  const provider = booking.provider as IProvider;

  const canCancel = ['pending', 'accepted'].includes(booking.status);
  const canPay    = booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && booking.status !== 'rejected';
  const canReview = booking.status === 'completed' && !booking.reviewId;

  // Handle payment/retry
  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const orderRes = await paymentAPI.createOrder(id);
      const { orderId, amount, keyId } = orderRes.data.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        notifyError('Payment Error', 'Could not load payment gateway.');
        setPaymentLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key:         keyId,
        amount,
        currency:    'INR',
        name:        'Smart Service Marketplace',
        description: typeof service === 'object' ? service.title : `Booking #${id.slice(-6)}`,
        order_id:    orderId,
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment({ ...response, bookingId: id });
            success('Payment Successful!', 'Your booking is confirmed.');
            loadBooking(); // Refresh booking
          } catch {
            notifyError('Verification Failed', 'Please contact support.');
          }
        },
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: user.phone,
        },
        theme: { color: '#D4AF37' },
      });
      rzp.open();
    } catch (err) {
      notifyError('Payment Failed', (err as Error).message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingAPI.cancel(id, cancelReason || undefined);
      success('Cancelled', 'Your booking has been cancelled.');
      setShowCancelModal(false);
      loadBooking();
    } catch (err) {
      notifyError('Error', (err as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  // Handle review
  const handleReview = async () => {
    if (!reviewComment.trim()) {
      notifyError('Review Required', 'Please write a comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewAPI.submit({
        provider: typeof provider === 'object' ? provider._id : provider,
        booking:  id,
        rating:   reviewRating,
        comment:  reviewComment,
      });
      success('Review Submitted!', 'Thank you for your feedback.');
      setShowReview(false);
      loadBooking();
    } catch (err) {
      notifyError('Error', (err as Error).message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Top bar */}
      <div className="bg-[#12121A] border-b border-[rgba(212,175,55,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/booking')}
            className="flex items-center gap-2 text-[#9090A0] hover:text-[#D4AF37] transition-colors text-sm"
          >
            <ArrowLeft size={16} /> My Bookings
          </button>
          <span className="text-[#55556A] text-xs">Booking #{id.slice(-6)}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Status tracker */}
        <BookingStatusComp status={booking.status} className="mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ── Main Info ────────────────────────────────── */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Service info card */}
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <h2 className="font-playfair font-bold text-[#F5F5F5] text-lg mb-4">Service Details</h2>

              <div className="flex items-start gap-4">
                {typeof service === 'object' && service.images?.[0] ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[rgba(212,175,55,0.1)]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[#12121A] flex items-center justify-center text-3xl flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
                    🔧
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#F5F5F5] font-semibold text-sm mb-1">
                    {typeof service === 'object' ? service.title : `Service #${String(service).slice(-6)}`}
                  </h3>
                  {typeof service === 'object' && (
                    <p className="text-[#9090A0] text-xs line-clamp-2 mb-2">{service.description}</p>
                  )}
                  <Link
                    href={`/services/${typeof service === 'object' ? service._id : service}`}
                    className="text-[#D4AF37] text-xs font-semibold hover:text-[#F0D060] transition-colors"
                  >
                    View Service →
                  </Link>
                </div>
              </div>
            </div>

            {/* Booking details card */}
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <h2 className="font-playfair font-bold text-[#F5F5F5] text-lg mb-4">Booking Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow icon={<Calendar size={15} />} label="Date" value={formatDate(booking.date)} />
                <DetailRow icon={<Clock size={15} />} label="Time Slot" value={booking.timeSlot} />
                <DetailRow
                  icon={<MapPin size={15} />}
                  label="Address"
                  value={`${booking.address.street}, ${booking.address.city}, ${booking.address.state} - ${booking.address.pincode}`}
                  fullWidth
                />
                {booking.address.landmark && (
                  <DetailRow icon={<MapPin size={15} />} label="Landmark" value={booking.address.landmark} />
                )}
                {booking.notes && (
                  <DetailRow icon={<FileText size={15} />} label="Notes" value={booking.notes} fullWidth />
                )}
                <DetailRow
                  icon={<AlertCircle size={15} />}
                  label="Emergency"
                  value={booking.isEmergency ? 'Yes (2× rate applied)' : 'No'}
                />
                <DetailRow
                  icon={<CreditCard size={15} />}
                  label="Payment"
                  value={booking.paymentStatus === 'paid' ? '✅ Paid' : booking.paymentStatus === 'refunded' ? '↩ Refunded' : '⏳ Pending'}
                />
              </div>

              {booking.cancellationReason && (
                <div className="mt-4 p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                  <p className="text-red-400 text-xs font-semibold mb-1">Cancellation Reason</p>
                  <p className="text-[#9090A0] text-sm">{booking.cancellationReason}</p>
                </div>
              )}

              {booking.rejectionReason && (
                <div className="mt-4 p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                  <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason</p>
                  <p className="text-[#9090A0] text-sm">{booking.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Provider card */}
            {typeof provider === 'object' && provider && (
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
                <h2 className="font-playfair font-bold text-[#F5F5F5] text-lg mb-4">Provider</h2>
                <div className="flex items-center gap-4">
                  <img
                    src={getAvatarUrl(provider.coverImage, provider.businessName)}
                    alt={provider.businessName}
                    className="w-14 h-14 rounded-xl object-cover border border-[rgba(212,175,55,0.2)] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[#F5F5F5] font-semibold text-sm">{provider.businessName}</span>
                      {provider.isVerified && <CheckCircle size={13} className="text-[#D4AF37]" />}
                    </div>
                    {typeof provider.rating === 'object' && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9090A0]">
                        <Star size={11} className="text-[#D4AF37] fill-[#D4AF37]" />
                        {provider.rating.average.toFixed(1)} ({provider.rating.count} reviews)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Review section */}
            {canReview && !showReview && (
              <Button variant="ghost" fullWidth onClick={() => setShowReview(true)} icon={<Star size={16} />}>
                Leave a Review
              </Button>
            )}

            {showReview && (
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
                <h3 className="font-semibold text-[#F5F5F5] text-base mb-4">Write a Review</h3>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={cn(
                          'transition-colors',
                          star <= reviewRating
                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                            : 'text-[#2A2A3A] hover:text-[#55556A]',
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-[#9090A0] text-sm">{reviewRating}/5</span>
                </div>

                <Textarea
                  label="Your Review"
                  placeholder="How was your experience with this service?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  required
                />

                <div className="flex gap-3 mt-4">
                  <Button variant="primary" loading={submittingReview} onClick={handleReview}>
                    Submit Review
                  </Button>
                  <Button variant="secondary" onClick={() => setShowReview(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Side: Amount & Actions ───────────────────── */}
          <div className="md:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4">
              {/* Amount card */}
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
                <span className="text-[#9090A0] text-xs uppercase tracking-wider font-semibold">Total Amount</span>
                <div className="flex items-baseline gap-1 mt-1 mb-4">
                  <span className="text-[#F5F5F5] font-playfair font-bold text-3xl">
                    {formatPrice(booking.amount)}
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-xs mb-4">
                  <div className="flex justify-between text-[#9090A0]">
                    <span>Status</span>
                    <span className={cn('px-2 py-0.5 rounded-full font-semibold border', getBookingStatusColor(booking.status))}>
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9090A0]">
                    <span>Payment</span>
                    <span className={cn(
                      'font-semibold',
                      booking.paymentStatus === 'paid' ? 'text-green-400' :
                      booking.paymentStatus === 'refunded' ? 'text-blue-400' :
                      booking.paymentStatus === 'failed' ? 'text-red-400' :
                      'text-yellow-400'
                    )}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9090A0]">
                    <span>Booked on</span>
                    <span className="text-[#C8C8D8]">{formatDate(booking.createdAt)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2.5">
                  {canPay && (
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      loading={paymentLoading}
                      onClick={handlePayment}
                      icon={<CreditCard size={16} />}
                    >
                      {booking.paymentStatus === 'failed' ? 'Retry Payment' : 'Pay Now'} — {formatPrice(booking.amount)}
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      variant="danger"
                      size="md"
                      fullWidth
                      onClick={() => setShowCancelModal(true)}
                      icon={<XCircle size={16} />}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl p-4">
                <h4 className="text-[#C8C8D8] text-xs font-semibold uppercase tracking-wider mb-2">Timeline</h4>
                <div className="flex flex-col gap-2 text-xs text-[#9090A0]">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span className="text-[#C8C8D8]">{formatDateTime(booking.createdAt)}</span>
                  </div>
                  {booking.acceptedAt && (
                    <div className="flex justify-between">
                      <span>Accepted</span>
                      <span className="text-[#C8C8D8]">{formatDateTime(booking.acceptedAt)}</span>
                    </div>
                  )}
                  {booking.completedAt && (
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="text-[#C8C8D8]">{formatDateTime(booking.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Help link */}
              <Link
                href="/help"
                className="text-center text-[#9090A0] text-xs hover:text-[#D4AF37] transition-colors py-2"
              >
                Need help? Contact support →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-playfair font-bold text-[#F5F5F5] text-lg mb-2">Cancel Booking</h3>
            <p className="text-[#9090A0] text-sm mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>

            <Textarea
              label="Reason (optional)"
              placeholder="Tell us why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />

            <div className="flex gap-3 mt-5">
              <Button variant="danger" loading={cancelling} onClick={handleCancel} fullWidth>
                Yes, Cancel Booking
              </Button>
              <Button variant="secondary" onClick={() => setShowCancelModal(false)} fullWidth>
                Keep Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helper ──────────────────────────────────────────────────────────────────── */
function DetailRow({ icon, label, value, fullWidth }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn('flex flex-col gap-1', fullWidth && 'sm:col-span-2')}>
      <span className="text-[#55556A] text-xs flex items-center gap-1.5">{icon} {label}</span>
      <span className="text-[#F5F5F5] text-sm">{value}</span>
    </div>
  );
}
