# GYM-OS — Master Test Credentials & Access Guide

This document contains all credentials, testing accounts, passwords, roles, access routes, and environment configuration for testing **GYM-OS**.

---

## 🔑 Universal Demo Password

All pre-configured testing accounts share the following password:

```text
GymCrm#Secure2026!xK
```

*(Note: Depending on your Clerk dashboard configuration, you can sign in with this password directly, or via Email OTP code sent to the email address).*

---

## 🔐 How Authentication Works

GYM-OS uses **Clerk Authentication** with bi-directional database synchronization:
1. Navigate to [`/sign-in`](http://localhost:3000/sign-in) or click **"Log In"** on the home page.
2. Enter the Email and Password (`GymCrm#Secure2026!xK`).
3. On sign-in, the system automatically checks your email address:
   - If the email is in `SUPER_ADMIN_EMAILS`, you enter the **`SUPER_ADMIN`** portal.
   - If the email is a Gym Owner / Admin in the database, you enter the **`ADMIN`** portal.
   - If the email belongs to coaching staff, you enter the **`TRAINER`** portal.
   - If the email belongs to an enrolled member, you enter the **`CUSTOMER`** portal.
   - If not invited, you are safely routed to `/not-invited`.

---

## 👑 1. Platform Super Admin

The Super Admin has complete cross-tenant visibility to provision new gym facilities, configure geofences, and appoint gym owners.

| Field | Value |
| :--- | :--- |
| **Email (Active in `.env`)** | `piyushchhabra3578@gmail.com` |
| **Email (Alternative / Seed)**| `superadmin@gymcrm.com` |
| **Password** | `GymCrm#Secure2026!xK` |
| **Full Name** | Platform Super Admin / Piyush Chhabra |
| **Role** | `SUPER_ADMIN` |
| **Facility Access** | All gyms (Cross-facility management) |
| **Primary Route** | [`/super-admin`](http://localhost:3000/super-admin) |
| **Direct Navigation** | • [Gym Management](/super-admin/gyms)<br>• [Provision New Facility](/super-admin/gyms/new) |

---

## 🏢 2. Gym Administrator / Facility Owner

Gym Admins manage member enrollments, staff payroll, offline/online payments, QR attendance kiosks, and facility configurations.

### Facility A: FitZone Elite Saket (Active Database Gym)
* **Gym ID**: `cmwb3qo4p0000d4nqgmwb1gc8`
* **Receipt Prefix**: `FZE` (Generates invoices: `FZE-2026-XXXXX`)
* **Location**: Select Citywalk, Saket District Centre, New Delhi, Delhi 110017
* **Coordinates**: Lat `28.528352`, Lng `77.219154` (Radius: 50m)

| Field | Value |
| :--- | :--- |
| **Email** | `owner.saket@fitzone.com` |
| **Password** | `GymCrm#Secure2026!xK` |
| **Full Name** | Aman Verma |
| **Phone** | `+91 98765 43210` |
| **Role** | `ADMIN` |
| **Primary Route** | [`/admin`](http://localhost:3000/admin) |
| **Direct Navigation** | • [People / Members](/admin/people)<br>• [Payments Ledger](/admin/payments)<br>• [Attendance Feed](/admin/attendance)<br>• [Reception QR Kiosk](/admin/attendance/qr)<br>• [Staff Salaries](/admin/salaries)<br>• [Subscriptions & Renewals](/admin/subscriptions)<br>• [Free Trials](/admin/trials)<br>• [Gym Settings & Plans](/admin/settings) |

### Facility B: Iron Peak Fitness (Seed Data Gym)
| Field | Value |
| :--- | :--- |
| **Email** | `admin.saket@ironpeak.com` |
| **Password** | `GymCrm#Secure2026!xK` |
| **Full Name** | Vikram Malhotra |
| **Role** | `ADMIN` |
| **Receipt Prefix** | `IPF` |

### Facility C: Zenith Strength Club (Pending Owner Claim)
| Field | Value |
| :--- | :--- |
| **Email** | `owner.bkc@zenithgym.com` |
| **Password** | `GymCrm#Secure2026!xK` |
| **Role** | `ADMIN` (Claimed automatically on first login via `pendingOwnerEmail`) |

---

## 🏋️‍♂️ 3. Coaching Staff / Trainers

Trainers track their assigned client attendance, log personal check-ins at the facility, and view monthly compensation records.

### FitZone Elite Saket
| Field | Value |
| :--- | :--- |
| **Email** | `trainer.vikram@fitzone.com` |
| **Password** | `GymCrm#Secure2026!xK` |
| **Full Name** | Vikram Malhotra |
| **Phone** | `+91 98111 22233` |
| **Role** | `TRAINER` |
| **Monthly Salary** | ₹45,000 / month (Due on 1st of every month) |
| **Primary Route** | [`/trainer`](http://localhost:3000/trainer) |
| **Direct Navigation** | • [My Clients](/trainer/customers)<br>• [My Attendance](/trainer/attendance)<br>• [Salary Statements](/trainer/salary)<br>• [Check-In Scanner](/checkin) |

### Iron Peak Fitness & Zenith Strength Club (Additional Seed Trainers)
* `arjun.kapoor@ironpeak.com` — Arjun Kapoor (Password: `GymCrm#Secure2026!xK`)
* `priya.nair@ironpeak.com` — Priya Nair (Password: `GymCrm#Secure2026!xK`)
* `tanvi.rao@zenithgym.com` — Tanvi Rao (Password: `GymCrm#Secure2026!xK`)
* `harsh.wardhan@zenithgym.com` — Harsh Wardhan (Password: `GymCrm#Secure2026!xK`)

---

## 🏃 4. Customers / Gym Members

Customers access their active workout pass validity, attendance log, personal trainer contact details, and mobile GPS check-in.

### Active Member (Annual VIP)
| Field | Value |
| :--- | :--- |
| **Email** | `member.rahul@fitzone.com` |
| **Password** | `GymCrm#Secure2026!xK` |
| **Full Name** | Rahul Sharma |
| **Phone** | `+91 99887 76655` |
| **Role** | `CUSTOMER` |
| **Status** | `ACTIVE` |
| **Membership Tier** | 1 Year Annual VIP |
| **Primary Route** | [`/customer`](http://localhost:3000/customer) |
| **Direct Navigation** | • [Attendance History](/customer/attendance)<br>• [Payment History](/customer/payments)<br>• [GPS Check-In Screen](/checkin) |

### Member Test Scenarios (Password for all: `GymCrm#Secure2026!xK`)
| Scenario | Email | Name | Status / Behavior |
| :--- | :--- | :--- | :--- |
| **Active (Normal)** | `rahul.sharma@example.com` | Rahul Sharma | Active (22 days left) |
| **Expiring Soon** | `rohan.v@example.com` | Rohan Varma | Active (5 days left — triggers urgent renewal pill) |
| **Active Trial** | `sneha.patel@example.com` | Sneha Patel | Trial (3 days left — test "Convert to Paid" action) |
| **Expiring Trial** | `kunal.s@example.com` | Kunal Singhania | Trial (1 day left) |
| **Expired Membership** | `pooja.h@example.com` | Pooja Hegde | Expired (12 days ago — testing expired banner) |
| **Cancelled Member** | `neha.roy@example.com` | Neha Roy | Cancelled (90 days ago) |

---

## 📍 5. Attendance & Geofence Testing Coordinates

When testing check-in at [`/checkin`](http://localhost:3000/checkin), you can use the built-in **Dev Geolocation Simulator**:

* **Gym Facility Location**: Select Citywalk, Saket (`28.528352, 77.219154`)
* **Maximum Allowed Perimeter**: `50 meters`

| Preset Button | Simulated Location | Distance | Result |
| :--- | :--- | :--- | :--- |
| **At Entrance (0m)** | `28.528352, 77.219154` | 0m | ✅ **Approved** (Check-in confirmed) |
| **60m Away** | `28.528892, 77.219154` | 60m | ❌ **Rejected** (Beyond 50m geofence) |
| **5km Away** | `28.573352, 77.219154` | ~5km | ❌ **Rejected** (Too far from facility) |
| **Weak Accuracy (120m)**| `28.528352, 77.219154` | ±120m | ❌ **Rejected** (GPS signal too weak) |

---

## ⚙️ 6. System Secrets & Developer Endpoints

| Resource | Purpose | Configuration / Value |
| :--- | :--- | :--- |
| **Daily Expiration Cron** | Flips expired memberships to `EXPIRED` & snapshots payroll | `POST /api/cron/expire-memberships`<br>Header: `Authorization: Bearer <CRON_SECRET>` |
| **QR Station Kiosk** | Reception tablet live rotating check-in display | [`/admin/attendance/qr`](http://localhost:3000/admin/attendance/qr) (Refreshes every 15s) |
| **Live Attendance Feed**| Real-time polling desk view | [`/admin/attendance`](http://localhost:3000/admin/attendance) |
| **Super Admin Bootstrap**| Sets roles automatically in `.env` | `SUPER_ADMIN_EMAILS="piyushchhabra3578@gmail.com"` |
