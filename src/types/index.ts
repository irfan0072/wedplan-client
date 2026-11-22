export type UserRole = 'customer' | 'vendor' | 'admin';
export type SubscriptionPlan = 'free' | 'premium';
export type ServiceStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  isBlocked: boolean;
  businessName?: string;
  phone?: string;
  bio?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string | null;
  createdAt: string;
}

export interface Service {
  _id: string;
  id?: string;
  vendorId: {
    _id: string;
    name: string;
    businessName?: string;
    image?: string;
    email?: string;
    phone?: string;
    subscriptionPlan?: SubscriptionPlan;
  } | string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: ServiceStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Booking {
  _id: string;
  id?: string;
  serviceId: {
    _id: string;
    serviceName: string;
    images: string[];
    price: number;
    category: string;
    location: string;
  };
  vendorId: {
    _id: string;
    name: string;
    businessName?: string;
    email?: string;
    phone?: string;
    image?: string;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
  eventDate: string;
  eventLocation: string;
  message?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  id?: string;
  vendorId: {
    _id: string;
    name: string;
    email: string;
    businessName?: string;
    image?: string;
  };
  plan: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}
