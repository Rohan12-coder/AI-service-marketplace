// ── Enums ─────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'provider' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash' | 'emi';

export type NotificationType =
  | 'booking_created' | 'booking_accepted' | 'booking_rejected'
  | 'booking_completed' | 'booking_cancelled'
  | 'payment_success' | 'payment_failed' | 'payment_refunded'
  | 'review_received' | 'provider_approved' | 'provider_rejected'
  | 'new_message' | 'emergency_request' | 'promotion' | 'system';

export type SortOption =
  | '-createdAt' | 'createdAt'
  | '-rating.average' | 'rating.average'
  | '-pricing.amount' | 'pricing.amount'
  | '-completedJobs';

// ── Location ──────────────────────────────────────────────────────────────────
export interface ILocation {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  location: ILocation;
  isVerified: boolean;
  isActive: boolean;
  savedProviders: string[] | IProvider[];
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    bookingUpdates: boolean;
    promotions: boolean;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  providerId?: string;
}

export interface LoginPayload   { email: string; password: string; }
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  businessName?: string;
  category?: string;
  serviceArea?: string;
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  image: string;
  isActive: boolean;
  order: number;
  serviceCount: number;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export interface ITimeSlot { start: string; end: string; }

export interface IProvider {
  _id: string;
  userId: string | IUser;
  businessName: string;
  description: string;
  category: string | ICategory;
  services: string[] | IService[];
  pricing: {
    min: number;
    max: number;
    currency: string;
    unit: 'hour' | 'job' | 'day' | 'visit';
  };
  location: ILocation & { serviceRadius: number };
  availability: {
    days: string[];
    timeSlots: ITimeSlot[];
    isAvailableNow: boolean;
  };
  rating: { average: number; count: number };
  completedJobs: number;
  isVerified: boolean;
  isApproved: boolean;
  isOnline: boolean;
  portfolio: { imageUrl: string; title: string; description: string; _id: string }[];
  languages: string[];
  responseTime: string;
  isEmergencyAvailable: boolean;
  coverImage: string;
  socialLinks: { website?: string; instagram?: string; facebook?: string; linkedin?: string };
  profileCompletionScore: number;
  tags: string[];
  yearsOfExperience: number;
  totalEarnings: number;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────
export interface IService {
  _id: string;
  title: string;
  description: string;
  category: string | ICategory;
  provider: string | IProvider;
  pricing: {
    amount: number;
    currency: string;
    unit: 'hour' | 'job' | 'day' | 'visit';
    isNegotiable: boolean;
  };
  duration: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isEmergencyAvailable: boolean;
  viewCount: number;
  bookingCount: number;
  rating: { average: number; count: number };
  createdAt: string;
  updatedAt: string;
}

// ── Booking ───────────────────────────────────────────────────────────────────
export interface IBookingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  landmark?: string;
}

export interface IBooking {
  _id: string;
  user: string | IUser;
  provider: string | IProvider;
  service: string | IService;
  date: string;
  timeSlot: string;
  address: IBookingAddress;
  notes: string;
  problemImages: string[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId: string;
  amount: number;
  isEmergency: boolean;
  emergencyFeeApplied: boolean;
  cancellationReason?: string;
  rejectionReason?: string;
  completedAt?: string;
  acceptedAt?: string;
  reviewId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Review ────────────────────────────────────────────────────────────────────
export interface IReview {
  _id: string;
  user: string | IUser;
  provider: string | IProvider;
  booking: string | IBooking;
  rating: number;
  comment: string;
  tags: string[];
  subRatings: {
    quality: number;
    timeliness: number;
    behavior: number;
    valueForMoney: number;
  };
  images: string[];
  aiSummary: string;
  isVerified: boolean;
  helpfulCount: number;
  providerReply?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Notification ──────────────────────────────────────────────────────────────
export interface INotification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, string | number | undefined>;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
  createdAt: string;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export interface IPayment {
  _id: string;
  user: string | IUser;
  provider: string | IProvider;
  booking: string | IBooking;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  amountInRupees: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method: PaymentMethod;
  description: string;
  receipt: string;
  platformFee: number;
  providerPayout: number;
  isEmergencyBooking: boolean;
  refund?: {
    razorpayRefundId: string;
    amount: number;
    status: 'pending' | 'processed' | 'failed';
    reason: string;
    processedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

// ── Search Filters ────────────────────────────────────────────────────────────
export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  distance?: number;
  lat?: number;
  lng?: number;
  emergency?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
  city?: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export interface UserDashboardStats {
  totalBookings: number;
  activeBookings: number;
  reviewsGiven: number;
  savedProviders: number;
}

export interface ProviderDashboardStats {
  totalEarnings: number;
  pendingRequests: number;
  completedJobs: number;
  averageRating: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeBookings: number;
}

// ── Razorpay ──────────────────────────────────────────────────────────────────
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}
