'use client';
import React, { useState } from 'react';
import { Calendar, MapPin, FileText, CheckCircle, Zap, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';
import { bookingAPI, paymentAPI } from '@/lib/api';
import { IService, IProvider } from '@/types';
import { formatPrice, generateTimeSlots, loadRazorpayScript, cn } from '@/lib/utils';
import { useNotification } from '@/context/NotificationContext';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';

const STEPS = ['Date & Time', 'Address', 'Details', 'Confirm'];
const TIME_SLOTS = generateTimeSlots(8, 20, 60);

const calculateEmergency = (amount: number) => amount * 2;

interface BookingFormProps {
  service:  IService;
  provider: IProvider;
  isEmergency?: boolean;
  onSuccess?: (bookingId: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ service, provider, isEmergency = false, onSuccess }) => {
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const { success, error }    = useNotification();

  const [form, setForm] = useState({
    date:      '',
    timeSlot:  '',
    street:    '',
    city:      '',
    state:     '',
    pincode:   '',
    landmark:  '',
    notes:     '',
    emergency: isEmergency,
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const baseAmount  = service.pricing.amount;
  const finalAmount = form.emergency ? calculateEmergency(baseAmount) : baseAmount;

  const canNext = [
    form.date && form.timeSlot,
    form.street && form.city && form.state && form.pincode,
    true,
    true,
  ][step];

  const handleBook = async () => {
    setLoading(true);
    try {
      const bookingRes = await bookingAPI.create({
        providerId: provider._id,
        serviceId:  service._id,
        date:       form.date,
        timeSlot:   form.timeSlot,
        address:    { street: form.street, city: form.city, state: form.state, pincode: form.pincode, landmark: form.landmark },
        notes:      form.notes,
        isEmergency: form.emergency,
      });
      const bookingId = bookingRes.data.data._id;

      // Initiate Razorpay payment
      const orderRes = await paymentAPI.createOrder(bookingId);
      const { orderId, amount, keyId } = orderRes.data.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) { error('Payment Error', 'Could not load payment gateway.'); setLoading(false); return; }

      const rzp = new window.Razorpay({
        key:         keyId,
        amount,
        currency:    'INR',
        name:        'Smart Service Marketplace',
        description: service.title,
        order_id:    orderId,
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment({ ...response, bookingId });
            success('Booking Confirmed!', 'Payment successful. Your booking is placed.');
            onSuccess?.(bookingId);
          } catch { error('Verification Failed', 'Contact support.'); }
        },
        prefill: {},
        theme: { color: '#D4AF37' },
      });
      rzp.open();
    } catch (err) {
      error('Booking Failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl overflow-hidden">
      {/* Progress bar */}
      <div className="flex border-b border-[rgba(212,175,55,0.08)]">
        {STEPS.map((s, i) => (
          <div key={s} className={cn('flex-1 py-3 text-center text-xs font-semibold border-r border-[rgba(212,175,55,0.08)] last:border-0 transition-all',
            i === step ? 'text-[#D4AF37] bg-[rgba(212,175,55,0.08)]' : i < step ? 'text-green-400' : 'text-[#55556A]')}>
            {i < step ? '✓' : i + 1}. {s}
          </div>
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Date & Time */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-[#D4AF37]" />
              <h3 className="font-semibold text-[#F5F5F5]">Select Date & Time</h3>
            </div>
            <Input label="Date" type="date" value={form.date} onChange={set('date')}
              min={new Date().toISOString().split('T')[0]} required />
            <div>
              <label className="text-sm font-medium text-[#C8C8D8] block mb-1.5">Time Slot <span className="text-[#D4AF37]">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button key={slot} type="button" onClick={() => setForm((p) => ({ ...p, timeSlot: slot }))}
                    className={cn('py-2 px-3 rounded-lg text-xs font-medium border transition-all',
                      form.timeSlot === slot
                        ? 'bg-[rgba(212,175,55,0.15)] border-[#D4AF37] text-[#D4AF37]'
                        : 'bg-[#12121A] border-[rgba(212,175,55,0.15)] text-[#9090A0] hover:border-[rgba(212,175,55,0.4)]')}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            {/* Emergency toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#12121A] rounded-xl border border-[rgba(212,175,55,0.1)] hover:border-[rgba(212,175,55,0.25)] transition-colors">
              <div onClick={() => setForm((p) => ({ ...p, emergency: !p.emergency }))}
                className={cn('relative w-10 h-5 rounded-full transition-all', form.emergency ? 'bg-red-500' : 'bg-[#2A2A3A]')}>
                <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', form.emergency ? 'left-5' : 'left-0.5')} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#F5F5F5]"><Zap size={14} className="text-red-400" /> Emergency Booking</div>
                <p className="text-xs text-[#9090A0]">Priority dispatch — 2× price ({formatPrice(calculateEmergency(baseAmount))})</p>
              </div>
            </label>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1"><MapPin size={18} className="text-[#D4AF37]" /><h3 className="font-semibold text-[#F5F5F5]">Service Address</h3></div>
            <Input label="Street Address" placeholder="Flat 4B, Sunshine Apts, MG Road" value={form.street} onChange={set('street')} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City"    placeholder="Mumbai"     value={form.city}    onChange={set('city')}    required />
              <Input label="State"   placeholder="Maharashtra" value={form.state}   onChange={set('state')}   required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Pincode" placeholder="400001" value={form.pincode}  onChange={set('pincode')}  required />
              <Input label="Landmark (optional)" placeholder="Near metro" value={form.landmark} onChange={set('landmark')} />
            </div>
          </div>
        )}

        {/* Step 3: Notes & Photos */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1"><FileText size={18} className="text-[#D4AF37]" /><h3 className="font-semibold text-[#F5F5F5]">Additional Details</h3></div>
            <Textarea label="Notes for the provider" placeholder="Describe the issue in detail..." value={form.notes} onChange={set('notes')} rows={4}
              hint="Tip: The more detail you provide, the better the professional can prepare." />
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1"><CheckCircle size={18} className="text-[#D4AF37]" /><h3 className="font-semibold text-[#F5F5F5]">Review & Confirm</h3></div>
            {[
              { label: 'Service',   value: service.title },
              { label: 'Provider',  value: provider.businessName },
              { label: 'Date',      value: form.date },
              { label: 'Time',      value: form.timeSlot },
              { label: 'Address',   value: `${form.street}, ${form.city}, ${form.state} - ${form.pincode}` },
              { label: 'Emergency', value: form.emergency ? 'Yes (2× rate)' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm border-b border-[rgba(212,175,55,0.06)] pb-2 last:border-0">
                <span className="text-[#9090A0]">{label}</span>
                <span className="text-[#F5F5F5] font-medium text-right max-w-[60%]">{value || '—'}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] rounded-xl">
              <span className="font-semibold text-[#F5F5F5]">Total Amount</span>
              <span className="font-bold text-[#D4AF37] text-lg font-playfair">{formatPrice(finalAmount)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 pb-6 gap-3">
        <Button variant="secondary" size="md" onClick={() => setStep((s) => s - 1)} disabled={step === 0} icon={<ArrowLeft size={15} />}>
          Back
        </Button>
        {step < 3 ? (
          <Button variant="primary" size="md" onClick={() => setStep((s) => s + 1)} disabled={!canNext} iconRight={<ArrowRight size={15} />}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" size="md" loading={loading} onClick={handleBook} icon={<CreditCard size={15} />}>
            Pay {formatPrice(finalAmount)}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
