'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookingAPI } from '@/lib/api';
import { IBooking, IService, IProvider, IUser } from '@/types';
import BookingStatusComp from '@/components/booking/BookingStatus';
import { formatDate, formatDateTime, formatPrice, getAvatarUrl } from '@/lib/utils';
import { MapPin, Calendar, Clock, ChevronLeft, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';

export default function BookingDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { success, error } = useNotification();

  const load = () => {
    if (!id) return;
    bookingAPI.getById(id)
      .then((r) => setBooking(r.data.data))
      .catch(() => router.push('/booking'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      await bookingAPI.cancel(booking._id, 'Cancelled by customer');
      success('Booking Cancelled', 'Your booking has been cancelled.');
      load();
    } catch (err) { error('Failed', (err as Error).message); }
    finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[rgba(212,175,55,0.2)] border-t-[#D4AF37] animate-spin" />
    </div>
  );
  if (!booking) return null;

  const svc  = booking.service  as IService;
  const prov = booking.provider as IProvider;
  const user = booking.user     as IUser;
  const provUser = prov?.userId as { phone?: string };

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#9090A0] hover:text-[#D4AF37] text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl">Booking Details</h1>
            <p className="text-[#9090A0] text-sm mt-0.5">#{booking._id.slice(-8).toUpperCase()}</p>
          </div>
          <BookingStatusComp status={booking.status} compact />
        </div>

        <div className="flex flex-col gap-5">
          {/* Status timeline */}
          <BookingStatusComp status={booking.status} />

          {/* Service & Provider */}
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
            <h2 className="font-semibold text-[#F5F5F5] mb-4 text-sm">Service & Provider</h2>
            <div className="flex items-center gap-4 mb-4">
              <img src={getAvatarUrl(prov?.coverImage, prov?.businessName)} alt="" className="w-14 h-14 rounded-2xl object-cover border border-[rgba(212,175,55,0.2)]" />
              <div>
                <p className="text-[#F5F5F5] font-semibold">{prov?.businessName}</p>
                <p className="text-[#9090A0] text-sm">{typeof svc === 'object' ? svc?.title : 'Service'}</p>
              </div>
              {provUser?.phone && (
                <a href={`tel:${provUser.phone}`} className="ml-auto flex items-center gap-1.5 px-3 py-2 border border-[rgba(212,175,55,0.2)] rounded-xl text-[#D4AF37] text-sm hover:bg-[rgba(212,175,55,0.08)] transition-colors">
                  <Phone size={14} /> Call
                </a>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-[#9090A0]"><Calendar size={14} className="text-[#D4AF37]" />{formatDate(booking.date)}</div>
              <div className="flex items-center gap-2 text-[#9090A0]"><Clock    size={14} className="text-[#D4AF37]" />{booking.timeSlot}</div>
              <div className="flex items-start gap-2 text-[#9090A0] sm:col-span-2">
                <MapPin size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                {`${booking.address.street}, ${booking.address.city}, ${booking.address.state} - ${booking.address.pincode}`}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
            <h2 className="font-semibold text-[#F5F5F5] mb-4 text-sm">Payment</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-[#9090A0]">Amount</span><span className="text-[#F5F5F5] font-semibold">{formatPrice(booking.amount)}</span></div>
              {booking.isEmergency && <div className="flex justify-between text-red-400"><span>Emergency Rate</span><span>Applied (2×)</span></div>}
              <div className="flex justify-between">
                <span className="text-[#9090A0]">Payment Status</span>
                <span className={booking.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                  {booking.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <h2 className="font-semibold text-[#F5F5F5] mb-2 text-sm flex items-center gap-2"><MessageSquare size={15} className="text-[#D4AF37]" /> Your Notes</h2>
              <p className="text-[#C8C8D8] text-sm leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Actions */}
          {['pending', 'accepted'].includes(booking.status) && (
            <div className="flex gap-3">
              <Button variant="danger" size="md" loading={cancelling} onClick={handleCancel} icon={<AlertCircle size={15} />}>
                Cancel Booking
              </Button>
              {booking.status === 'completed' && !booking.reviewId && (
                <Link href={`/reviews?booking=${booking._id}`} className="flex-1">
                  <Button variant="primary" size="md" fullWidth>Leave a Review</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
