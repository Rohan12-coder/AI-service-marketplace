import mongoose, { Document, Schema, Model } from 'mongoose';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface IBookingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  landmark?: string;
}

export interface IRescheduleLog {
  previousDate: Date;
  previousTimeSlot: string;
  reason: string;
  rescheduledAt: Date;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;        // e.g. '10:00 AM - 11:00 AM'
  address: IBookingAddress;
  notes: string;
  problemImages: string[]; // uploaded images of the problem
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId: string;       // Razorpay payment ID
  amount: number;
  isEmergency: boolean;
  emergencyFeeApplied: boolean;
  cancellationReason?: string;
  rejectionReason?: string;
  completedAt?: Date;
  acceptedAt?: Date;
  rescheduleLog: IRescheduleLog[];
  reviewId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingAddressSchema = new Schema<IBookingAddress>(
  {
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true },
    lat:      { type: Number },
    lng:      { type: Number },
    landmark: { type: String, default: '' },
  },
  { _id: false }
);

const RescheduleLogSchema = new Schema<IRescheduleLog>(
  {
    previousDate:     { type: Date, required: true },
    previousTimeSlot: { type: String, required: true },
    reason:           { type: String, default: '' },
    rescheduledAt:    { type: Date, default: Date.now },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'User is required'],
    },
    provider: {
      type:     Schema.Types.ObjectId,
      ref:      'Provider',
      required: [true, 'Provider is required'],
    },
    service: {
      type:     Schema.Types.ObjectId,
      ref:      'Service',
      required: [true, 'Service is required'],
    },
    date: {
      type:     Date,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type:     String,
      required: [true, 'Time slot is required'],
    },
    address: {
      type:     BookingAddressSchema,
      required: [true, 'Address is required'],
    },
    notes: {
      type:      String,
      default:   '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    problemImages: {
      type:    [String],
      default: [],
    },
    status: {
      type:    String,
      enum:    ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type:    String,
      enum:    ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    paymentId: {
      type:    String,
      default: '',
    },
    amount: {
      type:    Number,
      required: [true, 'Amount is required'],
      min:     0,
    },
    isEmergency: {
      type:    Boolean,
      default: false,
    },
    emergencyFeeApplied: {
      type:    Boolean,
      default: false,
    },
    cancellationReason: {
      type:   String,
      select: false,
    },
    rejectionReason: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    rescheduleLog: {
      type:    [RescheduleLogSchema],
      default: [],
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref:  'Review',
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ provider: 1, status: 1 });
BookingSchema.index({ service: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ isEmergency: 1 });
BookingSchema.index({ createdAt: -1 });

const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
