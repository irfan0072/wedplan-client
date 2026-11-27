# WedPlan — Wedding Planning Platform (Frontend Client)

WedPlan is a premier role-based wedding planning platform built with Next.js (App Router), TypeScript, and Tailwind CSS. The platform enables couples to discover curated wedding venues, cinematographers, stylists, florists, and caterers, while providing vendors and administrators with dedicated, role-guarded studios to manage services, inquiries, transactions, and platform governance.

---

## 💍 Important Features

### 1. Customer Experience
- **Public Service Directory**: High-performance browsing with real-time multi-attribute search by service name, category filtering, location filtering, and price sorting (ascending & descending).
- **Service Details & Dynamic Booking**: Rich photo galleries, vendor profile verification badges, and date reservation requests.
- **Self-Booking & Duplicate Protection**: Client & server safeguards prevent vendors from booking their own services and prevent duplicate active requests for the same date.
- **Customer Dashboard**: Overview metrics (total, pending, accepted, rejected bookings), booking cancellation with confirmation guards, and profile management.

### 2. Vendor Studio
- **Catalog Management**: Create, edit, toggle availability, and remove services with multipart image upload powered by ImgBB.
- **Tiered Service Limits**: Free vendors can publish up to 3 active services; Premium vendors enjoy unlimited active services.
- **Booking Requests Workflow**: Accept or reject incoming client requests with immutable status locking once processed.
- **Stripe Checkout Integration**: Seamless self-service subscription upgrade to Premium ($49/year) with cryptographic webhook verification.
- **Branding & Profile Customization**: Update studio logo, business biography, and direct client contact info.

### 3. Administrator Governance
- **Platform Analytics**: Real-time stats across users, vendors, customers, services, pending approvals, and transaction volumes.
- **User Moderation**: Filter users by role, inspect profiles, and block/unblock accounts with immediate platform feature revocation.
- **Service Moderation**: Review pending vendor listings, approve or reject submissions, and manage public visibility.
- **Immutable Transaction Ledger**: Monitor Stripe payment records (read-only audit trail).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components & Icons**: Lucide React, Framer Motion, Sonner Toast Notifications
- **Authentication**: JWT Token Storage & Reactive Auth Context with Official Google Identity Services (GIS) OAuth 2.0
- **Image Hosting**: ImgBB API Integration with base64 fallback
- **Payments**: Stripe Checkout

---

## ⚙️ Environment Variables

Create a `.env.local` file in the `client` root directory matching `.env.local.example`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/wedplan?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_here
NEXT_PUBLIC_APP_URL=https://wedplan-client-umber.vercel.app
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
IMGBB_API_KEY=your_imgbb_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

### 🌐 Google OAuth 2.0 Setup (GIS)
WedPlan integrates official Google Identity Services (GIS). To test with your own Google Cloud account:
1. Open the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) page.
2. Create an **OAuth 2.0 Client ID** with Application type: **Web application**.
3. Add **Authorized JavaScript origins**:
   - `https://wedplan-client-umber.vercel.app`
   - `http://localhost:3000`
4. Copy the Client ID into `.env.local` (or Vercel Environment Variables) as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

---

## 📦 Installation Instructions

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install
```

---

## 🏃 How to Run the Project Locally

```bash
# Start Next.js development server
npm run dev

# Open in browser
# http://localhost:3000
```

---

## 🔑 Demo & Evaluation Credentials

Quick-sign-in buttons are also provided on the `/login` page for fast evaluator access:

| Role | Email | Password | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@wedplan.com` | `Admin@123456` | `/dashboard/admin` |
| **Pro Vendor** | `elena.weddings@wedplan.com` | `Vendor@123456` | `/dashboard/vendor` |
| **Free Vendor** | `marcus.photo@wedplan.com` | `Vendor@123456` | `/dashboard/vendor` |
| **Customer** | `sophia@wedplan.com` | `Customer@123456` | `/dashboard/customer` |

---

## 🔗 Repository & Live Links

- **Client Repository**: [https://github.com/irfan0072/wedplan-client](https://github.com/irfan0072/wedplan-client)
- **Server Repository**: [https://github.com/irfan0072/wedplan-server](https://github.com/irfan0072/wedplan-server)
- **Live Website**: [https://wedplan-client-umber.vercel.app](https://wedplan-client-umber.vercel.app)
