import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'provider' | 'admin';

export interface INotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  bookingUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}

export interface ILocation {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // ✅ FIXED (made optional)
  phone: string;
  role: UserRole;
  avatar: string;
  location: ILocation;
  isVerified: boolean;
  isActive: boolean;
  savedProviders: mongoose.Types.ObjectId[];
  notificationPreferences: INotificationPreferences;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const LocationSchema = new Schema<ILocation>(
  {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    pincode: { type: String, default: '' },
  },
  { _id: false }
);

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    bookingUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'provider', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    location: {
      type: LocationSchema,
      default: () => ({}),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    savedProviders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
      },
    ],
    notificationPreferences: {
      type: NotificationPreferencesSchema,
      default: () => ({}),
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Partial<IUser>) {
        const {
          password,
          resetPasswordToken,
          resetPasswordExpires,
          ...rest
        } = ret;
        return rest;
      },
    },
  }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'location.city': 1 });

// ── Pre-save: hash password ──────────────────────────────────────────────────
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

// ── Instance method: compare password ───────────────────────────────────────
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password!);
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;