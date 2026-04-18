# VaxBook - Vaccine Booking Platform

Full-stack monorepo for vaccine discovery, hospital inventory/slot management, booking, cancellation, and super-admin governance.

## Monorepo Structure

- backend: Node.js + Express + MongoDB API
- frontend: React + Vite + Tailwind + GSAP UI

## Core Features

### Authentication and Roles

- Patient signup/login and profile
- Hospital admin signup/login and onboarding
- Super admin signup/login and platform control
- JWT-based role authorization

### Hospital Admin

- Upload verification documents
- Manage inventory (add, update, deactivate)
- Create new vaccine in master catalog
- Configure daily slot availability (Morning/Afternoon)
- View hospital bookings with filters

### Patient

- Search hospitals by city/pincode/vaccine type
- Explore hospital-specific vaccine availability
- Step flow booking: Hospital -> Vaccine -> Date -> Session
- Duplicate booking prevention for same vaccine/date
- Cancel confirmed bookings

### Super Admin

- Review hospital verification applications
- Approve/reject onboarding
- Blacklist/unblacklist hospitals anytime
- View vaccine coverage: which hospitals provide each vaccine

## Tech Stack

### Backend

- Node.js (ESM)
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- multer + Cloudinary (document storage)

### Frontend

- React
- Vite
- Tailwind CSS
- GSAP
- lucide-react icons

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- MongoDB instance
- Cloudinary account (for hospital document uploads)

### 1) Clone and install

```bash
# from repo root
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure backend env

Create `backend/.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/vaxbook
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
SUPER_ADMIN_SETUP_KEY=replace_with_setup_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend origin for CORS
CLIENT_ORIGIN=http://localhost:5173
```

### 3) Configure frontend env (optional)

Create `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:4000/api
```

If not set, frontend defaults to `http://localhost:4000/api`.

### 4) Seed database

```bash
cd backend
npm run seed
```

For clean reset seed:

```bash
npm run seed:force
```

### 5) Run backend

```bash
cd backend
npm run dev
```

### 6) Run frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`
Backend health: `http://localhost:4000/api/health`

## Seeded Demo Accounts

### Super Admin

- Email: `superadmin@vaxbook.in`
- Password: `SuperAdmin@123`

### Synthetic Hospital Admins

- Password for all synthetic hospital admins: `HospitalAdmin@123`
- Example emails:
  - `admin.mumbai.central@vaxbook.in`
  - `admin.delhi.metro@vaxbook.in`
  - `admin.bengaluru.north@vaxbook.in`
  - `admin.hyderabad.east@vaxbook.in`

## Backend Scripts

From `backend`:

- `npm run dev` - start backend with watch mode
- `npm run start` - start backend normally
- `npm run seed` - idempotent seed
- `npm run seed:force` - destructive reseed for demo data

## Frontend Scripts

From `frontend`:

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - lint

## API Modules

Base URL: `/api`

- `/auth` - signup/login/profile
- `/hospital-admin` - catalog, onboarding, inventory, slots, hospital bookings
- `/patient` - search hospitals, list slots, create/cancel bookings
- `/super-admin` - verification decisions, blacklist controls, vaccine coverage

## Data Model Overview

Main collections:

- `users` - all roles
- `hospitals` - hospital profile and platform status
- `hospitaladminverifications` - verification lifecycle and review notes
- `vaccines` - global vaccine master catalog
- `hospitalvaccines` - per-hospital inventory
- `vaccineslotdays` - per-hospital, per-vaccine, per-day session limits
- `bookings` - patient bookings with status lifecycle
- `govt_hospital_registry` - mock registry for registration number validation

## Consistency and Concurrency Rules

- Booking creation uses Mongo transactions.
- Booking blocks duplicate same patient + same vaccine + same date.
- Booking decrements inventory and increments slot booking atomically.
- Cancellation restores inventory and slot booked counts atomically.

## Blacklist/Suspension Behavior

When super admin blacklists a hospital:

- verification status becomes `suspended`
- hospital onboarding status becomes `suspended`
- hospital `isLive` becomes `false`
- hospital admin dashboard shows a blocked/blacklisted state

## Suggested Demo Flow (Evaluation)

1. Login as super admin and review verification panel.
2. Login as hospital admin and verify inventory + slots configuration.
3. Login as patient and book a slot through step-based flow.
4. Show booking appears and inventory decreases.
5. Cancel booking and show rollback in slot/inventory.
6. Blacklist hospital from super admin and show hospital admin blocked screen.
7. Use vaccine coverage panel to show hospitals per vaccine.

## Notes

- Local `uploads` static path is still supported for backward compatibility.
- Cloudinary upload redirect path is supported for legacy URL forms.
- Current repo has no automated tests configured yet.
