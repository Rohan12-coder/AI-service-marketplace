# ✦ AI-Powered Smart Service Marketplace

> A full-stack, production-ready platform to find, compare, and book local services — powered by **Gemini AI**, **Google Maps**, and **Razorpay**.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Step 1 — Setup Folders](#-step-1--setup-folders)
- [Step 2 — Get API Keys](#-step-2--get-api-keys)
- [Step 3 — Configure Environment Variables](#-step-3--configure-environment-variables)
- [Step 4 — Install Dependencies](#-step-4--install-dependencies)
- [Step 5 — Seed the Database](#-step-5--seed-the-database)
- [Step 6 — Run the Project](#-step-6--run-the-project)
- [Default Accounts](#-default-accounts)
- [Pages & Routes](#-pages--routes)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Project Overview

Smart Service Marketplace connects customers with verified local service providers. Key features:

- 🔍 **AI-Powered Search** — Natural language search using Google Gemini 1.5 Flash
- 🤖 **AI Chatbot** — Floating chatbot on every page for instant help
- ✨ **AI Review Summaries** — Gemini generates 2-sentence review summaries per provider
- 🗺️ **Map View** — Find providers near you with Google Maps
- 📅 **Real-time Booking** — 4-step booking flow with date/time selection
- 💳 **Payments** — Razorpay integration (UPI, cards, netbanking, wallets)
- 📧 **Email Notifications** — 7 transactional email templates via Gmail SMTP
- 🔐 **JWT Auth** — Role-based access: Customer · Provider · Admin
- 🚨 **Emergency Bookings** — Priority dispatch at 2× pricing

**Three user roles:**
| Role | Dashboard | Capabilities |
|------|-----------|-------------|
| Customer | `/dashboard/user` | Book services, track bookings, save providers |
| Provider | `/dashboard/provider` | Manage bookings, view earnings & analytics |
| Admin | `/dashboard/admin` | Approve providers, manage users & categories |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | JWT + bcryptjs |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Maps | Google Maps API + @react-google-maps/api |
| Payments | Razorpay |
| File Upload | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## 📁 Folder Structure

```
smart-service-marketplace/
├── backend/
│   ├── .env.example              ← Copy to .env and fill values
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts             ← Main entry point
│       ├── config/
│       │   ├── db.ts             ← MongoDB connection
│       │   ├── cloudinary.ts
│       │   └── env.ts
│       ├── models/               ← 8 Mongoose models
│       │   ├── User.ts
│       │   ├── Provider.ts
│       │   ├── Service.ts
│       │   ├── Booking.ts
│       │   ├── Review.ts
│       │   ├── Category.ts
│       │   ├── Notification.ts
│       │   └── Payment.ts
│       ├── routes/               ← 10 route files
│       ├── controllers/          ← 10 controller files
│       ├── middleware/           ← 5 middleware files
│       ├── utils/                ← jwt, email, helpers
│       └── scripts/
│           └── seed.ts           ← Database seeder
│
└── frontend/
    ├── .env.local.example        ← Copy to .env.local and fill values
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── app/
    │   ├── layout.tsx            ← Root layout (Navbar + Footer + ChatBot)
    │   ├── page.tsx              ← Home page
    │   ├── globals.css
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   ├── signup/page.tsx
    │   │   └── forgot-password/page.tsx
    │   ├── services/
    │   │   ├── page.tsx          ← Services listing with filters
    │   │   └── [id]/page.tsx     ← Service detail + booking widget
    │   ├── map/page.tsx
    │   ├── booking/
    │   │   ├── page.tsx          ← Booking form (Razorpay)
    │   │   └── [id]/page.tsx     ← Booking detail + status
    │   ├── dashboard/
    │   │   ├── user/page.tsx
    │   │   ├── provider/page.tsx
    │   │   └── admin/page.tsx
    │   ├── profile/page.tsx
    │   ├── reviews/page.tsx
    │   ├── about/page.tsx
    │   ├── contact/page.tsx
    │   ├── help/page.tsx
    │   ├── privacy/page.tsx
    │   └── terms/page.tsx
    ├── components/
    │   ├── ui/                   ← Button, Input, Modal, Card, Badge, etc.
    │   ├── layout/               ← Navbar, Footer, Sidebar
    │   ├── home/                 ← Hero, CategoryGrid, HowItWorks, etc.
    │   ├── services/             ← SearchBar, ServiceFilters, ServiceCard
    │   ├── booking/              ← BookingForm, BookingStatus
    │   ├── dashboard/            ← StatsCard, BookingTable, AnalyticsChart
    │   └── ai/                   ← ChatBot, AIReviewSummary
    ├── context/
    │   ├── AuthContext.tsx
    │   └── NotificationContext.tsx
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useLocation.ts
    │   └── useBooking.ts
    ├── lib/
    │   ├── api.ts                ← All typed API helpers
    │   ├── auth.ts
    │   └── utils.ts
    └── types/
        └── index.ts              ← All TypeScript interfaces
```

---

## ✅ Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **Git** — https://git-scm.com
- **MongoDB Atlas account** — https://cloud.mongodb.com (free)
- A code editor (VS Code recommended)

---

## 📁 Step 1 — Setup Folders

Create this exact structure and place all files as shown above:

```bash
mkdir smart-service-marketplace
cd smart-service-marketplace
mkdir backend frontend
```

Then place the downloaded files into `backend/` and `frontend/` exactly matching the folder structure above.

---

## 🔑 Step 2 — Get API Keys

### A. MongoDB Atlas (FREE)
1. Go to https://cloud.mongodb.com → Sign up
2. Create a free **M0** cluster
3. Create a database user with a strong password
4. Under **Network Access** → Add IP → Allow access from anywhere (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → Copy the connection string
6. Replace `<password>` and add your database name:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/smart-marketplace?retryWrites=true&w=majority
   ```

### B. Google Gemini API Key (FREE tier available)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google → Click **Create API Key**
3. Copy the key (starts with `AIza...`)

### C. Google Maps API Key
1. Go to https://console.cloud.google.com
2. Create a project → **APIs & Services** → **Library**
3. Enable: **Maps JavaScript API**, **Geocoding API**, **Places API**, **Distance Matrix API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Add billing account (Google gives $200 free credit/month)

### D. Cloudinary (FREE)
1. Go to https://cloudinary.com → Sign up free
2. Dashboard shows **Cloud Name**, **API Key**, **API Secret**

### E. Razorpay (FREE for test mode)
1. Go to https://razorpay.com → Sign up
2. **Settings** → **API Keys** → Toggle to **Test Mode** → **Generate Test Key**
3. Copy **Key ID** (`rzp_test_...`) and **Key Secret**

### F. Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Search **App Passwords** → Select **Mail** → **Other** → Name it → **Generate**
4. Copy the 16-character password (remove spaces)

### G. JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## ⚙️ Step 3 — Configure Environment Variables

### Backend — `backend/.env`
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and fill in:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart-marketplace?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_64_char_hex_from_step_g
JWT_EXPIRES_IN=7d

# Gemini AI  ← NOT OpenAI
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123xyz...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=yoursixteencharapp

# URLs
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@yoursite.com
```

### Frontend — `frontend/.env.local`
```bash
cd ../frontend
cp .env.local.example .env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

> ⚠️ **Never put secrets in frontend env vars.** Only the three `NEXT_PUBLIC_` vars above.

---

## 📦 Step 4 — Install Dependencies

Open **two separate terminals**:

```bash
# Terminal 1 — Backend
cd smart-service-marketplace/backend
npm install

# Terminal 2 — Frontend
cd smart-service-marketplace/frontend
npm install
```

> Each install takes 2–5 minutes. Warnings are normal.

---

## 🌱 Step 5 — Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- ✅ **10 service categories** (Plumbing, Electrical, Cleaning, etc.)
- ✅ **Admin account**
- ✅ **3 sample provider accounts** with services

Output will show created credentials.

---

## ▶️ Step 6 — Run the Project

Run both servers simultaneously (keep both terminals open):

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

**Expected output:**

Backend:
```
✅  MongoDB connected: cluster0.xxxxx.mongodb.net
✅  Cloudinary configured
🚀  Server: http://localhost:5000
```

Frontend:
```
▲  Next.js 14.x.x
-  Local: http://localhost:3000
-  Ready in 3.2s
```

**Open in browser:**
- Frontend: http://localhost:3000
- API Health: http://localhost:5000/health

---

## 👤 Default Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marketplace.com | Admin@123456 |
| Provider | ramesh@test.com | Test@12345 |
| Provider | suresh@test.com | Test@12345 |
| Provider | priya@test.com | Test@12345 |

> ⚠️ Change all passwords after first login.

**To create a customer account:** Go to http://localhost:3000/signup and select "I need services".

---

## 📄 Pages & Routes

| Page | URL | Access |
|------|-----|--------|
| Home | `/` | Public |
| Services | `/services` | Public |
| Service Detail | `/services/:id` | Public |
| Map | `/map` | Public |
| Login | `/login` | Guest only |
| Signup | `/signup` | Guest only |
| Forgot Password | `/forgot-password` | Guest only |
| Booking Form | `/booking` | Logged in |
| Booking Detail | `/booking/:id` | Owner only |
| User Dashboard | `/dashboard/user` | User role |
| Provider Dashboard | `/dashboard/provider` | Provider role |
| Admin Panel | `/dashboard/admin` | Admin role |
| Profile | `/profile` | Logged in |
| Reviews | `/reviews` | Logged in |
| About | `/about` | Public |
| Contact | `/contact` | Public |
| Help | `/help` | Public |
| Privacy | `/privacy` | Public |
| Terms | `/terms` | Public |

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
PUT  /api/auth/change-password
```

### Services
```
GET  /api/services              ?q=&category=&minPrice=&maxPrice=&emergency=
GET  /api/services/featured
GET  /api/services/categories
GET  /api/services/:id
POST /api/services              (provider only)
PUT  /api/services/:id
DELETE /api/services/:id
```

### Providers
```
GET  /api/providers             ?category=&city=&minRating=&emergency=
GET  /api/providers/nearby      ?lat=&lng=&radius=
GET  /api/providers/:id
POST /api/providers
PUT  /api/providers/:id
PUT  /api/providers/:id/availability
GET  /api/providers/:id/bookings
GET  /api/providers/:id/analytics
```

### Bookings
```
GET  /api/bookings
POST /api/bookings
GET  /api/bookings/:id
PUT  /api/bookings/:id/status   { status: 'accepted'|'rejected'|'in-progress'|'completed' }
PUT  /api/bookings/:id/cancel
PUT  /api/bookings/:id/reschedule
DELETE /api/bookings/:id
```

### AI (Gemini)
```
POST /api/ai/chat               { message, history[], context? }
POST /api/ai/search             { query }
POST /api/ai/recommend          { preferences, location, previousBookings }
POST /api/ai/summarize-reviews  { providerId }
POST /api/ai/analyze-image      (multipart, image file)
```

### Payments
```
POST /api/payments/create-order  { bookingId }
POST /api/payments/verify        { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
GET  /api/payments/history
POST /api/payments/refund/:id
```

### Admin
```
GET  /api/admin/dashboard
GET  /api/admin/analytics
GET  /api/admin/users
PUT  /api/admin/users/:id/status
DELETE /api/admin/users/:id
GET  /api/admin/providers
PUT  /api/admin/providers/:id/approve
GET  /api/admin/bookings
GET  /api/admin/categories
POST /api/admin/categories
PUT  /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

---

## 🔧 Troubleshooting

### ❌ Cannot connect to MongoDB
- Check `MONGODB_URI` has no typos
- Replace `<password>` with your actual password
- MongoDB Atlas → Network Access → add `0.0.0.0/0`

### ❌ Gemini AI not working
- Check `GEMINI_API_KEY` is set in `backend/.env`
- Visit https://aistudio.google.com/app/apikey to generate a new key
- Key must start with `AIza`

### ❌ Google Maps not loading
- Ensure all 4 APIs are enabled in Google Cloud Console
- Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `frontend/.env.local`
- Add billing account (required, $200 free/month)

### ❌ Razorpay payment not working
- Ensure `RAZORPAY_KEY_ID` starts with `rzp_test_` in test mode
- Both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` must be in `backend/.env`
- Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` goes in `frontend/.env.local`

### ❌ "Module not found" errors
```bash
# Delete node_modules and reinstall
cd backend  && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

### ❌ Port already in use
```bash
npx kill-port 5000  # Backend
npx kill-port 3000  # Frontend
```

### ❌ Email not sending
- Use Gmail **App Password** (not your login password)
- 2-Step Verification must be ON for App Passwords to work
- Check `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`

### ❌ Cloudinary upload failing
- Check all three Cloudinary values in `backend/.env` (Cloud Name, API Key, API Secret)
- These go in **backend** only — never in frontend env

---

## 🚀 Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🌐 Deployment

| Service | Best For | Free Tier |
|---------|----------|-----------|
| **Vercel** | Frontend (Next.js) | ✅ Yes |
| **Railway** | Backend (Express) | ✅ Yes |
| **Render** | Backend (Express) | ✅ Yes |
| **MongoDB Atlas** | Database | ✅ M0 Free |

**Recommended:**
- Frontend → **Vercel** (auto-detects Next.js)
- Backend  → **Railway** or **Render**
- Database → **MongoDB Atlas** (already cloud)

---

## 🔒 Security Checklist (before going live)

- [ ] Change all seeded passwords
- [ ] Set `NODE_ENV=production` in backend
- [ ] Add real domain to Google Maps API restrictions
- [ ] Switch Razorpay from Test → Live mode
- [ ] Remove `0.0.0.0/0` from MongoDB Network Access — use server IP only
- [ ] Rotate JWT secret
- [ ] Enable HTTPS (Vercel/Railway handle this automatically)

---

*Built with ❤️ using Next.js 14, Express.js, MongoDB, Google Gemini AI, and Razorpay*
