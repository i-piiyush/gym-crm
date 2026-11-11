# Enterprise Multi-Tenant Gym CRM

A production-grade, multi-tenant Gym Management & CRM platform built with Next.js 15 App Router, TypeScript (strict), Tailwind CSS, shadcn/ui, Clerk authentication, Prisma ORM, and PostgreSQL.

---

## 🌟 System Architecture & Highlights

- **Strict Multi-Tenancy**: Platform Super Admin creates facilities and sets coordinates manually. Gym Owners (Admins) manage staff and customers within an enforced 50-member capacity limit. Every database query, repository, and server action re-verifies gym scoping and caller roles.
- **Bi-Directional Clerk Auth Sync**: Idempotent synchronization via both Svix-verified webhooks (`/api/webhooks/clerk`) and post-sign-in fallback (`syncUserFromClerk`). Roles and gym memberships are derived strictly from database invitations matched by verified email.
- **Geofenced 15-Second Rotating QR Attendance**: Check-in stations project stateless HMAC-SHA256 rotating QR tokens refreshed every 15 seconds (with 30-second dual-window tolerance). Customers and trainers check in using browser GPS with strict Haversine distance verification ($\le 50\text{m}$) and GPS accuracy validation ($\le 50\text{m}$). Includes a dev-only coordinate simulator gated by `ENABLE_GEO_SIMULATOR`.
- **Atomic Yearly Sequential Receipts**: Generates GST-compliant receipts formatted as `{receiptPrefix}-{YYYY}-{00001}` (e.g. `FIT-2026-00001`) via a database transaction on `ReceiptCounter (gymId, year)` that automatically resets each calendar year.
- **Automated PDF Invoices & Gmail SMTP**: Invoices rendered server-side via `@react-pdf/renderer` and delivered to customer inboxes via Nodemailer Gmail SMTP, with tamper-proof 30-day signed public download tokens (`/api/receipts/[token]`) and a 100 emails/gym/day safety guardrail.
- **Idempotent Trainer Payroll**: Monthly salary cycles snapshotted with `createMany` + `skipDuplicates` against unique `(trainerId, month)` constraints.
- **Automated Expiration Cron**: Protected endpoint (`/api/cron/expire-memberships`) flips overdue trials and memberships to `EXPIRED` and triggers monthly payroll snapshots across all active facilities.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Actions, `src/` directory) |
| **Language** | TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`) |
| **Styling** | Tailwind CSS + shadcn/ui tokens (Sonner for all toast alerts) |
| **Icons** | `react-icons/lu` exclusively |
| **Animations** | `motion` (imported from `motion/react`, `prefers-reduced-motion` compliant) |
| **Authentication** | Clerk (JWT session + middleware route protection + Clerk Invitations API) |
| **Validation** | Zod (shared client + server schemas) |
| **Database & ORM**| PostgreSQL + Prisma ORM (10 relational models) |
| **Forms** | `react-hook-form` + `@hookform/resolvers/zod` |
| **QR Code** | `qrcode.react` (client generator) + `html5-qrcode` |
| **PDF Generation**| `@react-pdf/renderer` (server-side streamable PDF buffers) |
| **Email Delivery**| Nodemailer (Gmail SMTP with connection pooling & rate limits) |
| **Timezone & Dates**| `date-fns` + `date-fns-tz` (default `Asia/Kolkata`) |

---

## 🏢 Role Hierarchy & Permissions

```mermaid
flowchart TD
    SA["Super Admin (Platform Owner)"] -->|Creates gyms, sets GPS coords, invites owners| G["Gym Facility"]
    G -->|Owned by| A["Gym Admin (Owner)"]
    A -->|Manages plans, payments, invites trainers| T["Trainers (Coaching Staff)"]
    A -->|Enrolls up to 50 members, issues receipts| C["Customers (Members)"]
    T -->|Supervises assigned| C
```

1. **SUPER_ADMIN**:
   - Manages all gym facilities and platform status.
   - Sets physical GPS coordinates (`latitude`, `longitude`) and attendance radius manually (locked for gym owners).
   - Invites gym owners by email; resends or revokes pending owner invitations.
2. **ADMIN (Gym Owner)**:
   - Manages their gym exclusively (trainers, customers, membership plans, payments, trainer salaries).
   - Attendance geofence display is strictly read-only.
   - Enforces a hard limit of 50 active customers per gym.
3. **TRAINER**:
   - Sees only their assigned customers.
   - Monitors client attendance for today.
   - Scans QR station to log their own shifts and reviews monthly salary statements.
4. **CUSTOMER**:
   - Sees only their own data: membership pass status, validity countdown, assigned coach details, check-in history, and PDF receipts.
   - Scans reception QR to log attendance within 50m of facility center.

---

## 📂 Project Structure

```
src/
├── app/                              # Route Pages & Route Handlers only
│   ├── (auth)/sign-in & sign-up/     # Clerk authentication routes
│   ├── (super-admin)/super-admin/    # Super admin gyms CRUD & owner management
│   ├── (admin)/admin/                # Admin portal (dashboard, people, payments, salaries, etc.)
│   ├── (trainer)/trainer/            # Trainer portal (clients, attendance, salary history)
│   ├── (customer)/customer/          # Customer portal (pass validity, streaks, receipts)
│   ├── checkin/page.tsx              # Geolocation check-in terminal (+ dev simulator)
│   └── api/
│       ├── webhooks/clerk/           # Svix-verified user sync webhook
│       ├── attendance/check-in/      # Coordinate & QR verification endpoint
│       ├── attendance/qr-token/      # 15s rotating HMAC QR token generator
│       ├── attendance/today/         # Live attendance polling endpoint
│       ├── cron/expire-memberships/  # Daily cron job (memberships + payroll)
│       └── receipts/[token]/         # Signed 30-day PDF receipt streaming
├── actions/                          # Safe server actions (Zod-validated & role-scoped)
├── components/
│   ├── layout/                       # Sidebar, BottomNav, Topbar, PageHeader
│   ├── motion/                       # FadeIn, PressableButton, AnimatedNumber, CountdownRing
│   └── shared/                       # StatCard, StatusBadge, ConfirmDialog, PhoneInput
├── config/                           # env.ts (Zod fail-fast validation), navigation.ts
├── constants/                        # roles.ts, routes.ts, attendance.ts (RADIUS=50m, QR=15s)
├── db/                               # Prisma client singleton + repositories (gymId scoped)
├── features/                         # Domain-specific UI components & tables
├── lib/                              # Safe action creator, session, date, format utils
├── schemas/                          # Zod schemas (ONLY location for schemas)
├── services/                         # Business logic (attendance, email, payments, receipts)
├── styles/globals.css                # Tailwind CSS variables and design tokens
└── types/                            # TypeScript interfaces & domain types
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- PostgreSQL database (local or Supabase / Neon)
- Clerk account ([clerk.com](https://clerk.com))
- Gmail account with an App Password (for receipt email delivery)

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in the required keys:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: Clerk application credentials.
- `CLERK_WEBHOOK_SIGNING_SECRET`: Secret from Clerk webhook dashboard (wh_sec_...).
- `SUPER_ADMIN_EMAILS`: Comma-separated emails to automatically bootstrap Super Admin access.
- `QR_TOKEN_SECRET`: 32+ character random string for HMAC-SHA256 rotating QR tokens.
- `RECEIPT_LINK_SECRET`: 32+ character random string for 30-day signed PDF receipts.
- `CRON_SECRET`: Bearer token for triggering `/api/cron/expire-memberships`.
- `ENABLE_GEO_SIMULATOR`: Set to `"true"` for local development (enables GPS simulator on `/checkin`). Must be `"false"` in production.
- `GMAIL_SMTP_USER` & `GMAIL_SMTP_APP_PASSWORD`: 16-character Google App Password.

### 3. Database Migration & Seed
Run Prisma migrations and seed the database with demo facilities, trainers, and customers:

```bash
# Push schema migrations
npx prisma migrate dev --name init

# Seed database with Saket & BKC gyms, trainers, and members
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demo Credentials & Seed Data

The database seed provides two fully configured gyms:
1. **FitZone Saket** (New Delhi): Latitude `28.524428`, Longitude `77.216721`, Radius `50m`, Prefix `FSK`.
2. **IronForge BKC** (Mumbai): Latitude `19.065749`, Longitude `72.868350`, Radius `50m`, Prefix `IFB`.

### Seed Accounts
- **Super Admin**: `superadmin@gymcrm.local` (Platform Administrator)
- **Saket Gym Owner**: `saket.owner@fitzone.local` (Admin)
- **BKC Gym Owner**: `bkc.owner@ironforge.local` (Admin)
- **Trainers**: `trainer.vikram@fitzone.local`, `trainer.anjali@fitzone.local`, `trainer.rohit@ironforge.local`, `trainer.sneha@ironforge.local`
- **Customers**: 20 pre-seeded members with active, trial, and expired subscriptions.

---

## 🔄 Testing Workflows

### 1. Attendance Geofencing & QR Code
1. Log in as Gym Admin and navigate to **Attendance > Launch QR Station** (`/admin/attendance/qr`).
2. Observe the 15-second countdown ring rotating HMAC tokens in real time.
3. Open `/checkin` in an incognito window as a customer or trainer:
   - When `ENABLE_GEO_SIMULATOR="true"`, choose **"At Gym (0m away)"** and click **"Scan & Check In"**. Check-in is approved immediately.
   - Choose **"60m Away (Beyond 50m Radius)"** or **"Weak GPS Accuracy (120m)"**. Notice check-in is rejected server-side with precise distance feedback.
4. Check the **Live Attendance Feed** (`/admin/attendance`) to see the check-in logged via real-time 10-second polling.

### 2. Payments & Sequential Receipts
1. In the Gym Admin portal, open **Payments** (`/admin/payments`).
2. Click **Record Payment**, choose a customer and a membership tier (e.g. "Annual Fitness", ₹14,999).
3. The server atomically increments the gym's sequential counter (e.g. `FSK-2026-00001`), extends the member's subscription validity, and compiles a branded PDF receipt.
4. Click **Download PDF** to inspect the `@react-pdf/renderer` invoice, or test **Resend Email** to dispatch via Gmail SMTP.

### 3. Expiration Cron & Payroll
1. Run the cron endpoint using your `CRON_SECRET`:
   ```bash
   curl -X POST http://localhost:3000/api/cron/expire-memberships \
     -H "Authorization: Bearer dev-cron-secret-change-in-production"
   ```
2. The cron automatically flips expired trial passes and active memberships to `EXPIRED`, and snapshots trainer payroll for the current month across all facilities.

---

## 🔒 Verification & Quality Assurance

- **TypeScript Compilation**: `npx tsc --noEmit` $\rightarrow$ **0 errors** (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Production Build**: `npm run build` $\rightarrow$ **32 static & dynamic routes compiled successfully**.
- **Design Tokens**: Standardized CSS variables in `src/styles/globals.css` with dark mode support.
- **Accessibility**: All animations support `prefers-reduced-motion` fallbacks via `useReducedMotion()`.

