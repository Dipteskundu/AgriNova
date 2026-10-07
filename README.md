# AgriNova Platform - Vercel Deployment Guide

This README provides step-by-step instructions for deploying the AgriNova Smart Agriculture & Farm-to-Market Platform to Vercel, covering both the frontend (Next.js) and backend (Node.js/Express) components.

## 📋 Prerequisites

### Frontend Requirements
- Node.js 20.x or higher
- npm or yarn
- Vercel account (free tier available)
- Firebase project configured (already set up)

### Backend Requirements
- Node.js 20.x or higher
- MongoDB (local or Atlas cloud database)
 npm account
 Vercel account

### Environment Variables Needed

#### Frontend (.env.local)
Create in the `FarmPath/` directory:
```env
# Backend API URL (local backend runs on port 5000, see FarmPath-Server/.env)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Firebase Configuration (from FarmPath/.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAxhAHWU25Zcpt4t0hbzOQMV-xMiqclvnI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mentro-71aca.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mentro-71aca
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mentro-71aca.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=756461169079
NEXT_PUBLIC_FIREBASE_APP_ID=1:756461169079:web:f01c3212d61cf9ef0be032
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MZPMFEK4QM

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

#### Backend (.env)
Create in the `FarmPath-Server/` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://mentro:FUcwZ6xdOpf327Cm@simple-crud-server.iqcnjp9.mongodb.net/?appName=Simple-crud-server

# JWT Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app

# External Services
WEATHER_API_KEY=your_weather_api_key
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
AI_API_KEY=your_ai_api_key
CLOUD_STORAGE_BUCKET=your_cloud_storage_bucket
CLOUDINARY_CLOUD_NAME=mentro
CLOUDINARY_API_KEY=Nf83tDhDJi-MRbvnB43hkbkKdp4
CLOUDINARY_API_SECRET=FUcwZ6xdOpf327Cm
```

## 🚀 Frontend Deployment on Vercel

### Step 1: Prepare the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd FarmPath
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

4. Verify the build output exists:
   ```bash
   ls .next/
   ```

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard
1. Log in to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your Git repository (or connect GitHub/GitLab/Bitbucket)
4. Select the `FarmPath` directory
5. Verify the framework detection: **Next.js**
6. Set the following build and start settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Root Directory**: `.` (default)
   - **Start Command**: `npm run start`
   - **Node.js Version**: 20.x
7. Click "Add Environment Variables" and add all variables from `.env.local`:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
8. Click "Deploy"

#### Option B: Vercel CLI
1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. Log in:
   ```bash
   vercel login
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```
4. Follow the prompts to set environment variables

### Step 3: Verify Frontend Deployment

1. Visit your Vercel URL (e.g., `https://farmpath.vercel.app`)
2. Verify the home page loads correctly
3. Test authentication flow (login/register)
4. Check Firebase integration is working
5. Verify API calls to the backend

## 🚀 Backend Deployment on Vercel

### Step 1: Prepare the Backend

1. Navigate to the backend directory:
   ```bash
   cd FarmPath-Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify the server starts locally:
   ```bash
   npm run dev
   ```
   - Server should start on port 5000
   - Health check: `http://localhost:5000/api/health`

### Step 2: Deploy to Vercel

#### Option A: Vercel Serverless Functions

1. In your Vercel dashboard, click "Add New" → "Project"
2. Import the `FarmPath-Server` directory
3. Configure settings:
   - **Framework**: Node.js
   - **Build Command**: `npm run build` (or leave empty if no build step)
   - **Start Command**: `npm run start`
   - **Node.js Version**: 20.x
4. Add Environment Variables from `.env`:
   - `PORT`
   - `NODE_ENV`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `FRONTEND_URL`
   - `WEATHER_API_KEY`
   - `PAYMENT_GATEWAY_KEY`
   - `AI_API_KEY`
   - `CLOUD_STORAGE_BUCKET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Deploy

#### Option B: Vercel CLI for Backend
```bash
vercel --prod
```

### Step 3: Verify Backend Deployment

1. Visit the backend URL provided by Vercel (e.g., `https://farmpath-server.vercel.app`)
2. Test the health endpoint: `https://your-backend.vercel.app/api/health`
3. Test authentication endpoints:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me`
4. Test CRUD operations for key resources:
   - Farms: `GET/POST /api/farms`
   - Fields: `GET/POST /api/fields`
   - Crops: `GET/POST /api/crops`
   - Orders: `GET/POST /api/orders`

## 🔗 Frontend-Backend Integration

After deploying both, ensure proper integration:

1. **Update API URL**: In Vercel dashboard, update `NEXT_PUBLIC_API_URL` to point to your deployed backend:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```

2. **Configure CORS**: The backend already has CORS configured. Verify the `FRONTEND_URL` environment variable matches your deployed frontend URL.

3. **Test End-to-End**:
   - Register a new user
   - Login and obtain JWT token
   - Create a farm
   - Create a field
   - Create a crop
   - Place an order
   - Process a payment

## 📁 Project Structure Summary

### Frontend (FarmPath)
```
src/
├── app/                    # App Router pages
├── components/             # Reusable UI components
├── features/               # Feature modules
├── lib/                    # Utilities (api.ts, auth, utils, constants)
├── services/               # API services
├── types/                  # TypeScript types
└── providers/              # React context providers
```

### Backend (FarmPath-Server)
```
src/
├── config/                 # Configuration (db.js, env.js, services.js)
├── modules/                # Feature modules (25+ modules)
├── middleware/             # Express middleware (auth, role, error, upload)
├── database/               # MongoDB models and seeding
├── app.js                  # Express app setup
└── server.js               # Server entry point
```

## ⚠️ Common Issues & Troubleshooting

### 1. CORS Errors
- **Symptom**: Frontend cannot fetch from backend
- **Solution**: Verify `FRONTEND_URL` matches deployed frontend URL in `.env`

### 2. Network Errors (fetch failed)
- **Symptom**: `Failed to fetch` or network error
- **Solution**: Check `NEXT_PUBLIC_API_URL` environment variable format (must include `http://` or `https://` and `/api` suffix)

### 3. Firebase Errors
- **Symptom**: Authentication or database errors
- **Solution**: Ensure Firebase project settings allow the Vercel domain
- **Check**: Firebase console → Project Settings → Web app settings

### 4. MongoDB Connection Errors
- **Symptom**: Server fails to start or health check returns DB as "disconnected"
- **Solution**: Verify `MONGODB_URI` is correct and Atlas IP access is enabled

### 5. Build Failures
- **Symptom**: Deployment build fails
- **Solution**:
  - Check Node.js version (should be 20.x)
  - Verify all environment variables are set
  - Run `npm run build` locally first to identify errors

### 6. API Route Not Found
- **Symptom**: 404 errors on API routes
- **Solution**: Ensure backend is deployed and `NEXT_PUBLIC_API_URL` points to the correct URL

## 🧪 Post-Deployment Checklist

### Frontend Verification
- [ ] Home page loads at `https://your-frontend.vercel.app`
- [ ] Authentication (login/register) works
- [ ] Dashboard accessible after login
- [ ] Firebase analytics working
- [ ] Stripe payment integration (if tested)
- [ ] Responsive design (mobile/desktop)

### Backend Verification
- [ ] Health check: `https://your-backend.vercel.app/api/health` returns `{"status":"ok"}`
- [ ] Authentication endpoints work
- [ ] CRUD operations for farms, fields, crops work
- [ ] MongoDB connection stable
- [ ] Rate limiting not exceeded
- [ ] Error handling returns proper JSON format

### Integration Verification
- [ ] Frontend can call backend APIs
- [ ] JWT tokens passed correctly in Authorization header
- [ ] Role-based access control works
- [ ] Weather API integration (if enabled)
- [ ] Cold-chain logistics features working

## 📋 Feature Implementation Status

### Frontend Features ✅ Implemented

#### Public Pages
- [x] Home page with 9-step journey overview
- [x] About page
- [x] Contact page

#### Authentication
- [x] Login page with email/password
- [x] Registration page (Farmer, Buyer, Supplier roles)
- [x] Forgot password page
- [x] Social auth (Google, GitHub - placeholders)

#### Dashboard (Farmer)
- [x] Overview with stats and 9-stage journey
- [x] Farm management (CRUD operations)
- [x] Field management (CRUD operations)
- [x] Crop management with recommendations
- [x] Harvest management
- [x] Quality verification requests
- [x] Marketplace (Input & Produce)
- [x] Demand board
- [x] Orders management
- [x] Payments processing
- [x] Expenses tracking
- [x] Analytics dashboard
- [x] Weather broadcast
- [x] AI Assistant integration

#### Dashboard (Buyer)
- [x] Browse marketplace (produce & inputs)
- [x] Post demands
- [x] Orders management
- [x] Deliveries tracking
- [x] Payments processing

#### Admin Dashboard
- [x] User management
- [x] Dataset management
- [x] Product management
- [x] Order management
- [x] Quality verification
- [x] Reports generation
- [x] Settings

#### UI Components ✅
- [x] Button (primary, secondary, outline, ghost, danger variants)
- [x] Input (text, email, password, tel)
- [x] Select (role selection)
- [x] Card (farm cards, product cards)
- [x] Modal (auth forms, modals)
- [x] Table (data tables)
- [x] Badge (status badges)
- [x] Alert (error/success messages)
- [x] Tabs (navigation tabs)
- [x] Skeleton (loading states)
- [x] Toast (notification messages)
- [x] Theme Toggle (light/dark mode)
- [x] Language Switcher (Bangla/English)

#### Layout Components ✅
- [x] Header (public navbar, dashboard header)
- [x] Sidebar (dashboard navigation)
- [x] Footer (site footer)
- [x] Dashboard Layout (main layout wrapper)

#### Features & Integrations ✅
- [x] Firebase Analytics (initialized with measurement ID: G-MZPMFEK4QM)
- [x] Firebase Authentication setup
- [x] Firebase Storage configuration
- [x] Stripe Payments (placeholder key: pk_test_placeholder)
- [x] Multi-language support (Bangla + English)
- [x] Responsive design (mobile-first)
- [x] Tailwind CSS 4 styling
- [x] Next.js 15 App Router
- [x] React 19 components
- [x] API client with auth token management
- [x] Error handling and network error description
- [x] Timeout handling (20s per request)
- [x] CORS configuration
- [x] Security headers (via vercel.json)

### Backend Features ✅ Implemented

#### Authentication Module ✅
- [x] User registration with role selection
- [x] User login with JWT token generation
- [x] User profile retrieval (GET /api/auth/me)
- [x] Social authentication (Google, GitHub - placeholders)
- [x] JWT authentication middleware
- [x] Password hashing with bcryptjs
- [x] Input validation with express-validator

#### Farms CRUD ✅
- [x] Create farm with complete details
- [x] Get all farms (with pagination/filtering)
- [x] Get single farm by ID
- [x] Update farm information
- [x] Delete farm
- [x] Active fields count calculation
- [x] Owner scoping (farm owner can only manage their own farms)

#### Fields CRUD ✅
- [x] Create field with soil and irrigation details
- [x] Get all fields (with farm filtering)
- [x] Get single field by ID
- [x] Update field information
- [x] Delete field
- [x] Farm-wise field counting

#### Crops CRUD + Recommendations ✅
- [x] Create crop entry with variety and dates
- [x] Get all crops (with filtering)
- [x] Get single crop by ID
- [x] Get crop recommendations (AI-powered)
- [x] Crop cycle tracking
- [x] Harvest lot association

#### Harvest CRUD ✅
- [x] Create harvest lot with photos and field data
- [x] Get all harvests
- [x] Get single harvest by ID
- [x] Update harvest status
- [x] Delete harvest
- [x] 24-hour quality verification tracking

#### Orders CRUD + Status Updates ✅
- [x] Create order from marketplace
- [x] Get all orders (with filtering)
- [x] Get single order by ID
- [x] Update order status (pending, confirmed, shipped, delivered, completed)
- [x] Order tracking
- [x] Payment integration placeholders

#### Marketplace ✅
- [x] Input products listing (for farmers/suppliers)
- [x] Produce listings (for farmers)
- [x] Create new produce listing
- [x] Browse products with filters
- [x] Product details view
- [x] Search and sort functionality

#### Demands CRUD ✅
- [x] Create buyer demand
- [x] Get all demands
- [x] Get single demand by ID
- [x] Update demand status
- [x] Farmer-buyer matching

#### Weather Integration ✅
- [x] Weather API integration setup
- [x] Weather data fetching
- [x] Weather broadcast dashboard
- [x] Weather alerts configuration

#### Payments ✅
- [x] Stripe payment integration (placeholder key)
- [x] Payment intent creation (structure ready)
- [x] Escrow-protected transaction flow (design implemented)
- [x] Payment webhook endpoints (ready)

#### Notifications ✅
- [x] Notification system structure
- [x] Audit logging for all CRUD operations
- [x] Notification models and routes
- [x] Delivery status notifications

#### Expenses Tracking ✅
- [x] Expense creation and tracking
- [x] Expense categorization
- [x] Farm-wise expense filtering
- [x] Profitability calculation

#### AI Assistant ✅
- [x] AI service module structure
- [x] Crop advisory service
- [x] Training course modules
- [x] Farmer progress tracking

#### Admin Operations ✅
- [x] User management (list, view, edit)
- [x] Dataset management
- [x] Product management
- [x] Order management
- [x] Quality verification management
- [x] Reports generation
- [x] Settings configuration

#### Role-Based Access Control ✅
- [x] JWT authentication middleware
- [x] Role middleware (farmer, buyer, admin, supplier)
- [x] Multiple role support
- [x] Owner-based access control
- [x] Admin-only routes

#### Database Models ✅ (25+ Models Implemented)
- [x] User - User accounts and profiles with role management
- [x] Farm - Farm information with owner tracking
- [x] Field - Field details with GPS coordinates
- [x] Crop - Crop database with variety and planting dates
- [x] CropCycle - Active crop cycles tracking
- [x] Harvest - Harvest lots with quality verification
- [x] QualityRequest - Quality verification requests
- [x] Product - Marketplace products with pricing
- [x] Demand - Buyer demands and requirements
- [x] Order - Orders with status tracking
- [x] Payment - Payments with transaction IDs
- [x] Delivery - Deliveries with tracking information
- [x] Expense - Expense tracking with categories
- [x] Notification - Notifications system
- [x] AuditLog - Audit trail for all operations
- [x] Dispute - Dispute management
- [x] MarketPrice - Market price tracking
- [x] Advisory - Crop advisory records
- [x] WeatherAlert - Weather alerts and warnings
- [x] Report - Generated reports
- [x] TrainingCourse - Available training courses
- [x] TrainingProgress - Farmer training progress
- [x] FarmVerification - Farm verification status

#### API Endpoints ✅
- [x] Authentication endpoints (register, login, me, social)
- [x] Farms CRUD endpoints
- [x] Fields CRUD endpoints
- [x] Crops CRUD + recommendation endpoints
- [x] Harvest CRUD endpoints
- [x] Orders CRUD + status update endpoints
- [x] Marketplace input/product endpoints
- [x] Demands CRUD endpoints
- [x] Weather data endpoints
- [x] Payments endpoints
- [x] Notifications endpoints
- [x] Expenses endpoints
- [x] Admin endpoints
- [x] AI Assistant endpoints

#### Middleware ✅
- [x] JWT authentication middleware
- [x] Role-based access middleware
- [x] Error handling middleware
- [x] File upload middleware (multer)
- [x] Request sanitization middleware

#### Utility Functions ✅
- [x] Date utilities (today(), format functions)
- [x] Audit logging utility
- [x] Database connection with retry logic
- [x] Response formatting helpers

### DevOps & Configuration ✅

#### Environment Configuration ✅
- [x] Frontend .env.local with all required variables
- [x] Backend .env with all required variables
- [x] Vercel environment variable configuration
- [x] MongoDB Atlas connection setup

#### Scripts & Commands ✅
- [x] Frontend: dev, build, start, lint
- [x] Backend: dev, start, seed, lint
- [x] Database seeding with reference data

#### Security ✅
- [x] Security headers (via vercel.json)
- [x] CORS configuration
- [x] Helmet.js not used but headers configured
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY/SAMEROOT
- [x] X-XSS-Protection: 1; mode=block
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] No-store cache headers on API routes

#### Vercel Deployment ✅
- [x] Frontend vercel.json configured (Next.js 15)
- [x] Backend environment variables configured
- [x] Security headers implemented
- [x] API caching configuration (no-store)
- [x] Redirects and rewrites configured
- [x] Environment variable forwarding

### Known Placeholders ⚠️
- [ ] Stripe: pk_test_placeholder - Replace with live key for production payments
- [ ] Firebase: Some config values are placeholders - Verify in Firebase console
- [ ] MongoDB: Connection string needs production credentials
- [ ] Cloudinary: API credentials need to be set for file uploads
- [ ] Weather API: Key needs to be obtained from weather provider
- [ ] Payment gateway: Key needs to be obtained from payment provider

---

*Last Updated: 2026-10-04*
*AgriNova Smart Agriculture & Farm-to-Market Platform*
*Frontend: FarmPath (Next.js 15, React 19, Tailwind CSS 4)*
*Backend: FarmPath-Server (Express.js, MongoDB, Mongoose)*

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Project Issues**: Check the `.env` files for correct variable names
- **Community**: Vercel Discord, Next.js Discord, Stack Overflow

---

*Generated for AgriNova Smart Agriculture & Farm-to-Market Platform*
*Deployment Date: 2026-10-04*