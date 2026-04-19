import mongoose, { Document, Schema, Model } from 'mongoose';

export type PaymentMethod =
  | 'card'
  | 'upi'
  | 'netbanking'
  | 'wallet'
  | 'cash'
  | 'emi';

export type PaymentStatusType = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

export interface IRefund {
  razorpayRefundId: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  reason: string;
  processedAt?: Date;
}

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;          // in paise (INR smallest unit)
  amountInRupees: number;  // display amount
  currency: string;
  status: PaymentStatusType;
  method: PaymentMethod;
  description: string;
  receipt: string;
  notes: Record<string, string>;
  isEmergencyBooking: boolean;
  platformFee: number;     // marketplace commission
  providerPayout: number;  // amount after commission
  refund?: IRefund;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    razorpayRefundId: { type: String, required: true },
    amount:           { type: Number, required: true, min: 0 },
    status:           { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
    reason:           { type: String, default: '' },
    processedAt:      { type: Date },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
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
    booking: {
      type:     Schema.Types.ObjectId,
      ref:      'Booking',
      required: [true, 'Booking is required'],
    },
    razorpayOrderId: {
      type:    String,
      default: '',
    },
    razorpayPaymentId: {
      type:    String,
      default: '',
    },
    razorpaySignature: {
      type:   String,
      default: '',
      select: false,
    },
    amount: {
      type:     Number,
      required: [true, 'Amount is required'],
      min:      [0, 'Amount cannot be negative'],
    },
    amountInRupees: {
      type:     Number,
      required: true,
      min:      0,
    },
    currency: {
      type:    String,
      default: 'INR',
      uppercase: true,
    },
    status: {
      type:    String,
      enum:    ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    method: {
      type:    String,
      enum:    ['card', 'upi', 'netbanking', 'wallet', 'cash', 'emi'],
      default: 'upi',
    },
    description: {
      type:      String,
      default:   '',
      maxlength: 500,
    },
    receipt: {
      type: String,
      default: '',
    },
    notes: {
      type:    Map,
      of:      String,
      default: {},
    },
    isEmergencyBooking: {
      type:    Boolean,
      default: false,
    },
    platformFee: {
      type:    Number,
      default: 0,
      min:     0,
    },
    providerPayout: {
      type:    Number,
      default: 0,
      min:     0,
    },
    refund: {
      type: RefundSchema,
    },
    invoiceUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ provider: 1, createdAt: -1 });
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });
PaymentSchema.index({ status: 1 });

// ── Pre-save: calculate amounts ──────────────────────────────────────────────
PaymentSchema.pre<IPayment>('save', function (next) {
  // Convert paise to rupees
  if (this.amount && !this.amountInRupees) {
    this.amountInRupees = this.amount / 100;
  }
  // Calculate 10% platform fee
  if (this.amountInRupees && !this.platformFee) {
    this.platformFee   = Math.round(this.amountInRupees * 0.1 * 100) / 100;
    this.providerPayout = Math.round((this.amountInRupees - this.platformFee) * 100) / 100;
  }
  next();
});

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
