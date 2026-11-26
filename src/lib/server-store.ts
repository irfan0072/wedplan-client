import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Service, Booking, Transaction } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'wedplan_super_secret_jwt_key_2026_client_api_token';

// In-memory data store for serverless Next.js API routes
declare global {
  var __wedplan_store: {
    users: any[];
    services: any[];
    bookings: any[];
    transactions: any[];
  } | undefined;
}

function initStore() {
  if (global.__wedplan_store) {
    return global.__wedplan_store;
  }

  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('Admin@123456', salt);
  const vendorPass = bcrypt.hashSync('Vendor@123456', salt);
  const customerPass = bcrypt.hashSync('Customer@123456', salt);

  const users = [
    {
      _id: 'usr_admin_1',
      id: 'usr_admin_1',
      name: 'WedPlan Administrator',
      email: 'admin@wedplan.com',
      password: adminPass,
      role: 'admin',
      isBlocked: false,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 019-2831',
      bio: 'Platform Master Administrator for WedPlan Wedding Planning Platform.',
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr_vendor_premium',
      id: 'usr_vendor_premium',
      name: 'Elena Rostova',
      email: 'elena.weddings@wedplan.com',
      password: vendorPass,
      role: 'vendor',
      isBlocked: false,
      businessName: 'Royal Elegance Weddings & Events',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      bio: 'Award-winning luxury wedding planner and couture event designer with 12+ years experience.',
      subscriptionPlan: 'premium',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr_vendor_free',
      id: 'usr_vendor_free',
      name: 'Marcus Sterling',
      email: 'marcus.photo@wedplan.com',
      password: vendorPass,
      role: 'vendor',
      isBlocked: false,
      businessName: 'Sterling Visuals & Cinema',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 876-5432',
      bio: 'Documentary style wedding photographer capturing raw emotion and candid beauty.',
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr_customer_1',
      id: 'usr_customer_1',
      name: 'Sophia Montgomery',
      email: 'sophia@wedplan.com',
      password: customerPass,
      role: 'customer',
      isBlocked: false,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 432-1098',
      bio: 'Bride-to-be planning our dream autumn celebration in upstate New York.',
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
    },
  ];

  const services = [
    {
      _id: 'srv_1',
      id: 'srv_1',
      vendorId: users[2], // Marcus (Free)
      serviceName: 'Cinematic 4K Wedding Storytelling & Drone Film',
      category: 'Photography & Videography',
      description:
        'Full-day cinematic coverage featuring two master videographers, 4K aerial drone footage, teaser trailer delivered in 48 hours, and a full 20-minute highlight documentary film with professional audio mastering.',
      price: 2400,
      location: 'New York, NY',
      images: [
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_2',
      id: 'srv_2',
      vendorId: users[1], // Elena (Premium)
      serviceName: 'Editorial Fine-Art Portraiture & Film Photography',
      category: 'Photography & Videography',
      description:
        'Timeless medium-format film and digital hybrid wedding photography. Includes engagement portrait session, hand-bound leather keepsake album, and high-resolution online gallery with perpetual print release.',
      price: 3200,
      location: 'San Francisco, CA',
      images: [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_3',
      id: 'srv_3',
      vendorId: users[1], // Elena (Premium)
      serviceName: 'Villa Bellissima Waterfront Estate & Garden Pavilion',
      category: 'Wedding Venues',
      description:
        'Historic 19th-century private estate boasting Tuscan cypress gardens, panoramic waterfront sunset views, bridal suite pavilion, and indoor crystal chandelier ballroom accommodating up to 350 seated guests.',
      price: 8500,
      location: 'Miami, FL',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_4',
      id: 'srv_4',
      vendorId: users[1], // Elena (Premium)
      serviceName: 'The Glasshouse Botanical Conservatory & Sky Terrace',
      category: 'Wedding Venues',
      description:
        'Modern industrial-chic glasshouse filled with exotic greenery, towering palms, retractable glass ceiling for open-air stargazing ceremonies, and state-of-the-art acoustic surround sound.',
      price: 6800,
      location: 'Chicago, IL',
      images: [
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_5',
      id: 'srv_5',
      vendorId: users[1], // Elena (Premium)
      serviceName: 'Cascading Botanical Floral Arches & Table Scapes',
      category: 'Decoration & Florist',
      description:
        'Bespoke floral design featuring imported English garden roses, peonies, eucalyptus garlands, floating candelabras, grand ceremony arch, and personalized sweetheart table installations.',
      price: 3600,
      location: 'Austin, TX',
      images: [
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_6',
      id: 'srv_6',
      vendorId: users[2], // Marcus (Free)
      serviceName: 'Bohemian Fairy Tale Amber & Fairy Light Decor',
      category: 'Decoration & Florist',
      description:
        'Warm ambient lighting concepts featuring vintage Edison bulbs, hanging geometric lanterns, pampas grass installations, macramé ceremony backdrops, and rustic wooden dining tables.',
      price: 2100,
      location: 'Denver, CO',
      images: [
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_7',
      id: 'srv_7',
      vendorId: users[1], // Elena (Premium)
      serviceName: 'Grand Epicurean 5-Course Plated Banquet & Raw Bar',
      category: 'Catering Services',
      description:
        'Michelin-trained culinary brigade presenting gourmet farm-to-table cuisine. Includes artisanal cheese & charcuterie display, oysters raw bar, sommelier wine pairing, and midnight street-food snack station.',
      price: 5200,
      location: 'Los Angeles, CA',
      images: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_8',
      id: 'srv_8',
      vendorId: users[1], // Elena (Premium)
      serviceName: 'Bridal Glow Airbrush Makeup & Couture Hair Styling',
      category: 'Makeup & Styling',
      description:
        'Luxury on-location beauty suite for the bride and up to 6 bridesmaids. High-definition waterproof airbrush makeup, luxury silk lashes, bespoke veil placement, and touch-up concierge through reception.',
      price: 1450,
      location: 'Seattle, WA',
      images: [
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_9',
      id: 'srv_9',
      vendorId: users[1], // Elena (Premium)
      serviceName: 'Custom Hand-Embroidered Bridal Gowns & Groom Tuxedos',
      category: 'Wedding Fashion',
      description:
        'Haute couture bridal gown consultations, Italian silk fabric selections, Swarovski crystal beading, custom veil construction, and bespoke tailored Italian wool tuxedos with personalized monogramming.',
      price: 4500,
      location: 'New York, NY',
      images: [
        'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'srv_10',
      id: 'srv_10',
      vendorId: users[2], // Marcus (Free)
      serviceName: 'Artisanal Handcrafted 4-Tier Wedding Cake Atelier',
      category: 'Catering Services',
      description:
        'Bespoke sugar-flower cascading wedding cakes featuring organic Madagascar vanilla bean, champagne mousse, raspberry coulis, and custom monogram cake stand rental.',
      price: 1100,
      location: 'Boston, MA',
      images: [
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'pending', // Pending for admin review
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const bookings = [
    {
      _id: 'bkg_1',
      id: 'bkg_1',
      serviceId: services[0],
      vendorId: users[2],
      customerId: users[3],
      eventDate: '2026-10-14T00:00:00.000Z',
      eventLocation: 'Central Park Conservatory, NYC',
      message: 'We adore your cinematic portfolio and would love to reserve our October wedding with you!',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'bkg_2',
      id: 'bkg_2',
      serviceId: services[2],
      vendorId: users[1],
      customerId: users[3],
      eventDate: '2026-10-14T00:00:00.000Z',
      eventLocation: 'Villa Bellissima, Miami',
      message: 'Looking to confirm dinner seating for 180 guests.',
      status: 'accepted',
      createdAt: new Date().toISOString(),
    },
  ];

  const transactions = [
    {
      _id: 'tx_1',
      id: 'tx_1',
      vendorId: users[1],
      plan: 'premium',
      amount: 49.0,
      currency: 'usd',
      stripeSessionId: 'cs_test_seed_premium_vendor_session_98231',
      stripeSubscriptionId: 'sub_test_mock_seed_123',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    },
  ];

  global.__wedplan_store = { users, services, bookings, transactions };
  return global.__wedplan_store;
}

export const store = initStore();

export function generateToken(user: any): string {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      image: user.image,
      businessName: user.businessName,
      phone: user.phone,
      bio: user.bio,
      subscriptionPlan: user.subscriptionPlan || 'free',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export function handleApiError(err: any): { status: number; body: { success: boolean; message: string } } {
  if (err instanceof AuthError) {
    return { status: err.statusCode, body: { success: false, message: err.message } };
  }
  const isAuthMsg =
    err.message?.includes('Authentication') ||
    err.message?.includes('token') ||
    err.message?.includes('jwt');
  const isForbidden =
    err.message?.toLowerCase().includes('forbidden') ||
    err.message?.toLowerCase().includes('suspended');
  const status = isForbidden ? 403 : isAuthMsg ? 401 : 500;
  return { status, body: { success: false, message: err.message || 'Server error' } };
}

export function verifyAuthHeader(authHeader: string | null): any {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Authentication required. No token provided.', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let user = store.users.find(
      (u) =>
        u._id === decoded.id ||
        u.id === decoded.id ||
        (decoded.email && u.email?.toLowerCase() === decoded.email.toLowerCase())
    );
    if (!user && decoded.id && decoded.email && decoded.role) {
      // Rehydrate user from verified JWT across serverless instances/cold starts
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || decoded.email.split('@')[0],
        email: decoded.email.toLowerCase(),
        role: decoded.role,
        image: decoded.image,
        businessName: decoded.businessName || '',
        phone: decoded.phone || '',
        bio: decoded.bio || '',
        subscriptionPlan: decoded.subscriptionPlan || 'free',
        isBlocked: false,
        createdAt: new Date().toISOString(),
      };
      store.users.push(user);
    }
    if (!user) {
      throw new AuthError('User no longer exists.', 401);
    }
    if (user.isBlocked) {
      throw new AuthError('Account suspended by an administrator.', 403);
    }
    return user;
  } catch (err: any) {
    if (err instanceof AuthError) throw err;
    throw new AuthError('Invalid or expired authentication token.', 401);
  }
}
