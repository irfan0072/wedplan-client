import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export function mongoJson(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'x-wedplan-db': 'mongodb' },
  });
}

declare global {
  var __wedplan_mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    seeded: boolean;
  } | undefined;
}

const cached =
  global.__wedplan_mongoose ||
  (global.__wedplan_mongoose = { conn: null, promise: null, seeded: false });

export function isMongoConfigured(): boolean {
  const uri = process.env.MONGODB_URI;
  return Boolean(uri && !uri.includes('<username>') && !uri.includes('<password>'));
}

// ---------------------------------------------------------------------------
// Mongoose Schemas (matching server/src/models)
// ---------------------------------------------------------------------------

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    image: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    businessName: { type: String, default: '' },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    subscriptionPlan: { type: String, enum: ['free', 'premium'], default: 'free' },
    subscriptionExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ServiceSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Photography & Videography',
        'Wedding Venues',
        'Decoration & Florist',
        'Catering Services',
        'Makeup & Styling',
        'Wedding Fashion',
      ],
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BookingSchema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventDate: { type: Date, required: true },
    eventLocation: { type: String, required: true, trim: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const TransactionSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'premium' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    stripeSessionId: { type: String, required: true },
    stripeSubscriptionId: { type: String, default: '' },
    status: { type: String, enum: ['succeeded', 'pending', 'failed'], default: 'succeeded' },
  },
  { timestamps: true }
);

export const UserModel: Model<any> =
  mongoose.models.User || mongoose.model('User', UserSchema);
export const ServiceModel: Model<any> =
  mongoose.models.Service || mongoose.model('Service', ServiceSchema);
export const BookingModel: Model<any> =
  mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const TransactionModel: Model<any> =
  mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export function serializeDoc(doc: any): any {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj._id = obj._id.toString();
    obj.id = obj._id;
  }
  if (obj.password) {
    delete obj.password;
  }
  if (obj.vendorId && typeof obj.vendorId === 'object' && obj.vendorId._id) {
    obj.vendorId = serializeDoc(obj.vendorId);
  } else if (obj.vendorId) {
    obj.vendorId = obj.vendorId.toString();
  }
  if (obj.customerId && typeof obj.customerId === 'object' && obj.customerId._id) {
    obj.customerId = serializeDoc(obj.customerId);
  } else if (obj.customerId) {
    obj.customerId = obj.customerId.toString();
  }
  if (obj.serviceId && typeof obj.serviceId === 'object' && obj.serviceId._id) {
    obj.serviceId = serializeDoc(obj.serviceId);
  } else if (obj.serviceId) {
    obj.serviceId = obj.serviceId.toString();
  }
  return obj;
}

async function ensureSeeded() {
  if (cached.seeded) return;
  const userCount = await UserModel.countDocuments();
  if (userCount > 0) {
    cached.seeded = true;
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123456', salt);
  const vendorPassword = await bcrypt.hash('Vendor@123456', salt);
  const customerPassword = await bcrypt.hash('Customer@123456', salt);

  const [adminUser, premiumVendor, freeVendor, customer1] = await UserModel.insertMany([
    {
      name: 'WedPlan Administrator',
      email: 'admin@wedplan.com',
      password: adminPassword,
      role: 'admin',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 019-2831',
      bio: 'Platform Master Administrator for WedPlan Wedding Planning Platform.',
      subscriptionPlan: 'free',
    },
    {
      name: 'Elena Rostova',
      email: 'elena.weddings@wedplan.com',
      password: vendorPassword,
      role: 'vendor',
      businessName: 'Royal Elegance Weddings & Events',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      bio: 'Award-winning luxury wedding planner and couture event designer with 12+ years experience.',
      subscriptionPlan: 'premium',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Marcus Sterling',
      email: 'marcus.photo@wedplan.com',
      password: vendorPassword,
      role: 'vendor',
      businessName: 'Sterling Visuals & Cinema',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 876-5432',
      bio: 'Documentary style wedding photographer capturing raw emotion and candid beauty.',
      subscriptionPlan: 'free',
    },
    {
      name: 'Sophia Montgomery',
      email: 'sophia@wedplan.com',
      password: customerPassword,
      role: 'customer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 432-1098',
      bio: 'Bride-to-be planning our dream autumn celebration in upstate New York.',
      subscriptionPlan: 'free',
    },
  ]);

  const createdServices = await ServiceModel.insertMany([
    {
      vendorId: freeVendor._id,
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
    },
    {
      vendorId: premiumVendor._id,
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
    },
    {
      vendorId: premiumVendor._id,
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
    },
    {
      vendorId: premiumVendor._id,
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
    },
    {
      vendorId: premiumVendor._id,
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
    },
    {
      vendorId: freeVendor._id,
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
    },
    {
      vendorId: premiumVendor._id,
      serviceName: 'Gourmet 5-Course Plated Reception & Tasting Menu',
      category: 'Catering Services',
      description:
        'Michelin-trained culinary team offering customized farm-to-table seasonal courses, passed hors d’oeuvres cocktail hour, signature champagne tower, and full waitstaff service.',
      price: 5200,
      location: 'Los Angeles, CA',
      images: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
    },
    {
      vendorId: premiumVendor._id,
      serviceName: 'Bridal Red Carpet Glam & Hair Design Suite',
      category: 'Makeup & Styling',
      description:
        'On-location luxury airbrush makeup artistry and sculptural bridal hair styling. Includes full bridal trial session, mink lashes, touch-up kit, and styling for up to 5 bridesmaids.',
      price: 1450,
      location: 'New York, NY',
      images: [
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
    },
    {
      vendorId: premiumVendor._id,
      serviceName: 'Haute Couture Bespoke Bridal Gown & Tailoring',
      category: 'Wedding Fashion',
      description:
        'Private bridal atelier experience offering custom hand-beaded Chantilly lace gowns, bespoke silk tuxedos, 4 private tailoring fittings, and museum-grade gown preservation.',
      price: 4500,
      location: 'Boston, MA',
      images: [
        'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'approved',
      isActive: true,
    },
    {
      vendorId: freeVendor._id,
      serviceName: 'Analog Super 8mm Vintage Film Wedding Add-On',
      category: 'Photography & Videography',
      description:
        'Authentic Kodak Super 8mm film reels shot alongside digital coverage for a dreamy, nostalgic heirloom wedding film.',
      price: 1200,
      location: 'New York, NY',
      images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      ],
      status: 'pending',
      isActive: true,
    },
  ]);

  await BookingModel.insertMany([
    {
      serviceId: createdServices[0]._id,
      vendorId: freeVendor._id,
      customerId: customer1._id,
      eventDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      eventLocation: 'Hudson Valley, NY',
      message: 'We love your documentary style and would love drone footage of our vineyard ceremony!',
      status: 'pending',
    },
    {
      serviceId: createdServices[2]._id,
      vendorId: premiumVendor._id,
      customerId: customer1._id,
      eventDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      eventLocation: 'Miami Beach, FL',
      message: 'Looking to host 220 guests in the Waterfront Garden Pavilion.',
      status: 'accepted',
    },
  ]);

  await TransactionModel.create({
    vendorId: premiumVendor._id,
    plan: 'premium',
    amount: 49.0,
    currency: 'usd',
    stripeSessionId: 'cs_test_seed_premium_vendor_session_98231',
    stripeSubscriptionId: 'sub_test_mock_seed_123',
    status: 'succeeded',
  });

  // Unused variable suppression
  void adminUser;
  cached.seeded = true;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn) {
    await ensureSeeded();
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 5,
    });
  }

  cached.conn = await cached.promise;
  await ensureSeeded();
  return cached.conn;
}
