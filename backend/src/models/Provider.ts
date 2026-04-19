import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPricing {
  min: number;
  max: number;
  currency: string;
  unit: 'hour' | 'job' | 'day' | 'visit';
}

export interface IProviderLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  serviceRadius: number; // km
}

export interface ITimeSlot {
  start: string; // 'HH:MM'
  end: string;   // 'HH:MM'
}

export interface IAvailability {
  days: string[];      // ['Monday', 'Tuesday', ...]
  timeSlots: ITimeSlot[];
  isAvailableNow: boolean;
}

export interface IRating {
  average: number;
  count: number;
}

export interface IPortfolioItem {
  imageUrl: string;
  title: string;
  description: string;
}

export interface ISocialLinks {
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface IProvider extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description: string;
  category: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  pricing: IPricing;
  location: IProviderLocation;
  availability: IAvailability;
  rating: IRating;
  completedJobs: number;
  isVerified: boolean;
  isApproved: boolean;
  isOnline: boolean;
  portfolio: IPortfolioItem[];
  languages: string[];
  responseTime: string; // e.g. 'Within 1 hour'
  isEmergencyAvailable: boolean;
  coverImage: string;
  documents: string[];        // KYC / ID proof URLs
  socialLinks: ISocialLinks;
  profileCompletionScore: number;
  tags: string[];
  yearsOfExperience: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>(
  {
    min:      { type: Number, required: true, min: 0 },
    max:      { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    unit:     { type: String, enum: ['hour', 'job', 'day', 'visit'], default: 'job' },
  },
  { _id: false }
);

const ProviderLocationSchema = new Schema<IProviderLocation>(
  {
    lat:           { type: Number, default: 0 },
    lng:           { type: Number, default: 0 },
    address:       { type: String, default: '' },
    city:          { type: String, default: '' },
    state:         { type: String, default: '' },
    country:       { type: String, default: 'India' },
    pincode:       { type: String, default: '' },
    serviceRadius: { type: Number, default: 10 }, // km
  },
  { _id: false }
);

const TimeSlotSchema = new Schema<ITimeSlot>(
  {
    start: { type: String, required: true },
    end:   { type: String, required: true },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema<IAvailability>(
  {
    days: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    timeSlots: {
      type:    [TimeSlotSchema],
      default: [{ start: '09:00', end: '18:00' }],
    },
    isAvailableNow: { type: Boolean, default: false },
  },
  { _id: false }
);

const RatingSchema = new Schema<IRating>(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const PortfolioItemSchema = new Schema<IPortfolioItem>(
  {
    imageUrl:    { type: String, required: true },
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const SocialLinksSchema = new Schema<ISocialLinks>(
  {
    website:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    linkedin:  { type: String, default: '' },
  },
  { _id: false }
);

const ProviderSchema = new Schema<IProvider>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },
    businessName: {
      type:     String,
      required: [true, 'Business name is required'],
      trim:     true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    description: {
      type:      String,
      default:   '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref:  'Category',
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref:  'Service',
      },
    ],
    pricing: {
      type:     PricingSchema,
      default:  () => ({ min: 0, max: 0, currency: 'INR', unit: 'job' }),
    },
    location: {
      type:    ProviderLocationSchema,
      default: () => ({}),
    },
    availability: {
      type:    AvailabilitySchema,
      default: () => ({}),
    },
    rating: {
      type:    RatingSchema,
      default: () => ({ average: 0, count: 0 }),
    },
    completedJobs: { type: Number, default: 0 },
    isVerified:    { type: Boolean, default: false },
    isApproved:    { type: Boolean, default: false },
    isOnline:      { type: Boolean, default: false },
    portfolio: {
      type:    [PortfolioItemSchema],
      default: [],
    },
    languages: {
      type:    [String],
      default: ['Hindi', 'English'],
    },
    responseTime: {
      type:    String,
      default: 'Within 2 hours',
    },
    isEmergencyAvailable: { type: Boolean, default: false },
    coverImage:           { type: String, default: '' },
    documents:            { type: [String], default: [] },
    socialLinks: {
      type:    SocialLinksSchema,
      default: () => ({}),
    },
    profileCompletionScore: { type: Number, default: 0, min: 0, max: 100 },
    tags:                   { type: [String], default: [] },
    yearsOfExperience:      { type: Number, default: 0, min: 0 },
    totalEarnings:          { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
ProviderSchema.index({ userId: 1 }, { unique: true });
ProviderSchema.index({ category: 1 });
ProviderSchema.index({ isApproved: 1, isActive: 1 });
ProviderSchema.index({ 'location.city': 1 });
ProviderSchema.index({ 'location.lat': 1, 'location.lng': 1 });
ProviderSchema.index({ 'rating.average': -1 });
ProviderSchema.index({ isEmergencyAvailable: 1 });
ProviderSchema.index({ tags: 1 });

// ── Virtual: distance (populated via aggregation) ────────────────────────────
ProviderSchema.virtual('distance').get(function () {
  return (this as IProvider & { _distance?: number })._distance;
});

const Provider: Model<IProvider> = mongoose.model<IProvider>('Provider', ProviderSchema);
export default Provider;
