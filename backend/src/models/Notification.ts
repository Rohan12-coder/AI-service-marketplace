import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType =
  | 'booking_created'
  | 'booking_accepted'
  | 'booking_rejected'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_refunded'
  | 'review_received'
  | 'provider_approved'
  | 'provider_rejected'
  | 'new_message'
  | 'emergency_request'
  | 'promotion'
  | 'system';

export interface INotificationData {
  bookingId?: string;
  providerId?: string;
  serviceId?: string;
  paymentId?: string;
  reviewId?: string;
  actionUrl?: string;
  imageUrl?: string;
  amount?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: INotificationData;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_accepted',
        'booking_rejected',
        'booking_completed',
        'booking_cancelled',
        'payment_success',
        'payment_failed',
        'payment_refunded',
        'review_received',
        'provider_approved',
        'provider_rejected',
        'new_message',
        'emergency_request',
        'promotion',
        'system',
      ],
      required: [true, 'Notification type is required'],
    },
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type:      String,
      required:  [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    isRead: {
      type:    Boolean,
      default: false,
    },
    data: {
      type:    Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },
    expiresAt: {
      type: Date,
      // auto-delete after 30 days by default
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
export default Notification;
