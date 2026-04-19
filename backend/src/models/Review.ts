import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISubRatings {
  quality: number;      // 1-5
  timeliness: number;   // 1-5
  behavior: number;     // 1-5
  valueForMoney: number; // 1-5
}

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: number;        // overall 1-5
  comment: string;
  tags: string[];        // e.g. ['on-time', 'professional', 'affordable']
  subRatings: ISubRatings;
  images: string[];      // review images
  aiSummary: string;     // AI-generated summary snippet
  isVerified: boolean;   // verified purchase
  isVisible: boolean;    // moderated visibility
  helpfulCount: number;  // users who found review helpful
  reportCount: number;
  providerReply?: string;
  providerRepliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubRatingsSchema = new Schema<ISubRatings>(
  {
    quality:       { type: Number, min: 1, max: 5, default: 5 },
    timeliness:    { type: Number, min: 1, max: 5, default: 5 },
    behavior:      { type: Number, min: 1, max: 5, default: 5 },
    valueForMoney: { type: Number, min: 1, max: 5, default: 5 },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
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
      unique:   true, // one review per booking
    },
    rating: {
      type:     Number,
      required: [true, 'Rating is required'],
      min:      [1, 'Rating must be at least 1'],
      max:      [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type:      String,
      required:  [true, 'Review comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    tags: {
      type:    [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message:   'Cannot add more than 10 tags',
      },
    },
    subRatings: {
      type:    SubRatingsSchema,
      default: () => ({}),
    },
    images: {
      type:    [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message:   'Cannot upload more than 5 images per review',
      },
    },
    aiSummary: {
      type:    String,
      default: '',
    },
    isVerified: {
      type:    Boolean,
      default: true,   // auto-verified since booking ref is required
    },
    isVisible: {
      type:    Boolean,
      default: true,
    },
    helpfulCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    reportCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    providerReply: {
      type: String,
      maxlength: [1000, 'Reply cannot exceed 1000 characters'],
    },
    providerRepliedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
ReviewSchema.index({ provider: 1, isVisible: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ booking: 1 }, { unique: true });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

// ── Post-save: update provider rating average ─────────────────────────────────
ReviewSchema.post('save', async function () {
  const Provider = mongoose.model('Provider');
  const stats = await ReviewSchema.statics.calcProviderRating(this.provider);
  await Provider.findByIdAndUpdate(this.provider, {
    'rating.average': stats.avgRating,
    'rating.count':   stats.numReviews,
  });
});

ReviewSchema.post('deleteOne', { document: true }, async function () {
  const Provider = mongoose.model('Provider');
  const stats = await (this.constructor as Model<IReview>).aggregate([
    { $match: { provider: this.provider, isVisible: true } },
    {
      $group: {
        _id:       '$provider',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Provider.findByIdAndUpdate(this.provider, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count':   stats[0].numReviews,
    });
  } else {
    await Provider.findByIdAndUpdate(this.provider, {
      'rating.average': 0,
      'rating.count':   0,
    });
  }
});

ReviewSchema.statics.calcProviderRating = async function (
  providerId: mongoose.Types.ObjectId
) {
  const stats = await this.aggregate([
    { $match: { provider: providerId, isVisible: true } },
    {
      $group: {
        _id:       '$provider',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  return stats.length > 0
    ? { avgRating: Math.round(stats[0].avgRating * 10) / 10, numReviews: stats[0].numReviews }
    : { avgRating: 0, numReviews: 0 };
};

const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
