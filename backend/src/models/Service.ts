import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IServicePricing {
  amount: number;
  currency: string;
  unit: 'hour' | 'job' | 'day' | 'visit';
  isNegotiable: boolean;
}

export interface IService extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  pricing: IServicePricing;
  duration: number; // minutes
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isEmergencyAvailable: boolean;
  viewCount: number;
  bookingCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServicePricingSchema = new Schema<IServicePricing>(
  {
    amount:       { type: Number, required: true, min: 0 },
    currency:     { type: String, default: 'INR' },
    unit:         { type: String, enum: ['hour', 'job', 'day', 'visit'], default: 'job' },
    isNegotiable: { type: Boolean, default: false },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type:      String,
      required:  [true, 'Service title is required'],
      trim:      true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type:      String,
      required:  [true, 'Service description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type:     Schema.Types.ObjectId,
      ref:      'Category',
      required: [true, 'Category is required'],
    },
    provider: {
      type:     Schema.Types.ObjectId,
      ref:      'Provider',
      required: [true, 'Provider is required'],
    },
    pricing: {
      type:     ServicePricingSchema,
      required: true,
    },
    duration: {
      type:    Number,
      default: 60,
      min:     [15, 'Duration must be at least 15 minutes'],
    },
    images: {
      type:    [String],
      default: [],
    },
    tags: {
      type:    [String],
      default: [],
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    isFeatured: {
      type:    Boolean,
      default: false,
    },
    isEmergencyAvailable: {
      type:    Boolean,
      default: false,
    },
    viewCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    bookingCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
ServiceSchema.index({ provider: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1, isFeatured: 1 });
ServiceSchema.index({ tags: 1 });
ServiceSchema.index({ 'pricing.amount': 1 });
ServiceSchema.index({ 'rating.average': -1 });
ServiceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Service: Model<IService> = mongoose.model<IService>('Service', ServiceSchema);
export default Service;
