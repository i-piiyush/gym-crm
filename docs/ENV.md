# Environment Variables Specification (`docs/ENV.md`)

This document details every environment variable required by the Gym CRM application, including security classifications, source providers, setup instructions, and fail-fast validation behavior via Zod in `src/config/env.ts`.

---

## 1. Summary Matrix

| Variable Name | Environment | Required / Default | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Client & Server | **Required** | Canonical base URL for redirects, QR check-in URLs, and receipt download tokens. |
| `DATABASE_URL` | Server Only | **Required** | PostgreSQL connection string (transaction connection pooler e.g. Supabase port 6543 or local). |
| `DIRECT_URL` | Server Only | Optional | PostgreSQL direct connection string (session mode port 5432) for Prisma migrations. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client & Server | **Required** | Clerk public API key for client-side authentication SDK. |
| `CLERK_SECRET_KEY` | Server Only | **Required** | Clerk backend secret key for Server Actions and Clerk Invitations API. |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Server Only | **Required** | Svix webhook secret for verifying incoming `user.created` and `invitation.accepted` hooks. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Client & Server | `/sign-in` | Path to Clerk sign-in page. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Client & Server | `/sign-up` | Path to Clerk sign-up page. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Client & Server | `/` | Fallback post-login redirect path (middleware routes dynamically by role). |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Client & Server | `/` | Fallback post-signup redirect path (middleware routes dynamically by role). |
| `QR_TOKEN_SECRET` | Server Only | **Required** (min 32 chars) | HMAC-SHA256 secret for signing 15-second rotating attendance QR payloads. |
| `RECEIPT_LINK_SECRET` | Server Only | **Required** (min 32 chars) | HMAC-SHA256 secret for signing 30-day public receipt PDF download URLs. |
| `CRON_SECRET` | Server Only | **Required** (min 16 chars) | Bearer secret required to trigger `/api/cron/expire-memberships`. |
| `SUPER_ADMIN_EMAILS` | Server Only | **Required** | Comma-separated list of emails automatically assigned `SUPER_ADMIN` role upon first sign-in. |
| `DEFAULT_TIMEZONE` | Server Only | `Asia/Kolkata` | Fallback IANA timezone for gym date calculations (`date-fns-tz`). |
| `DEFAULT_COUNTRY_CODE` | Server Only | `+91` | Default country dial code for E.164 phone normalization. |
| `PAYMENT_PROVIDER` | Server Only | `demo` | Active payment gateway adapter: `demo` (instant success) or `razorpay`. |
| `RAZORPAY_KEY_ID` | Server Only | Optional | Razorpay API Key ID (required if `PAYMENT_PROVIDER=razorpay`). |
| `RAZORPAY_KEY_SECRET` | Server Only | Optional | Razorpay API Secret (required if `PAYMENT_PROVIDER=razorpay`). |
| `RAZORPAY_WEBHOOK_SECRET` | Server Only | Optional | Razorpay webhook secret for verifying payment capture webhooks. |
| `EMAIL_PROVIDER` | Server Only | `gmail-smtp` | Active email delivery adapter: `gmail-smtp` or `gmail-oauth`. |
| `GMAIL_SMTP_USER` | Server Only | Optional | The platform Gmail address used for sending receipts over SMTP. |
| `GMAIL_SMTP_APP_PASSWORD` | Server Only | Optional | 16-character Google App Password for the platform Gmail address. |
| `EMAIL_FROM_NAME_DEFAULT` | Server Only | `"Gym CRM"` | Default sender display name in receipt email headers. |
| `GOOGLE_OAUTH_CLIENT_ID` | Server Only | Optional | Google Cloud OAuth Client ID (for future per-owner Gmail API sending). |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Server Only | Optional | Google Cloud OAuth Client Secret (for future per-owner Gmail API sending). |

---

## 2. Security Boundaries

1. **Client vs. Server Separation**:
   - Variables prefixed with `NEXT_PUBLIC_` are bundled into client-side JS.
   - All server secrets (`CLERK_SECRET_KEY`, `QR_TOKEN_SECRET`, `GMAIL_SMTP_APP_PASSWORD`, `DATABASE_URL`, etc.) are stripped from client bundles.
   - `src/config/env.ts` enforces that server variables are never accessed in browser execution contexts.

2. **Secret Entropy Requirements**:
   - `QR_TOKEN_SECRET` and `RECEIPT_LINK_SECRET` must be at least 32 characters long.
   - You can generate secure secrets using OpenSSL:
     ```bash
     openssl rand -hex 32
     ```

---

## 3. Step-by-Step Guide: Google Gmail SMTP App Password

To send transaction receipt emails using `nodemailer` and Gmail SMTP (`smtp.gmail.com:465` or `587`), you **cannot** use your regular Google account password. Google requires an **App Password** linked to an account with **2-Step Verification** enabled.

### Step 1: Enable 2-Step Verification
1. Sign in to your platform Google Account (e.g. `gymcrm.platform@gmail.com`).
2. Go to **Google Account Settings**: [https://myaccount.google.com/](https://myaccount.google.com/).
3. In the left navigation panel, click **Security**.
4. Under **How you sign in to Google**, select **2-Step Verification**.
5. Follow the on-screen steps to configure and turn on 2-Step Verification (via SMS, Google Authenticator, or Security Key).

### Step 2: Generate the 16-Character App Password
1. Navigate directly to the App Passwords page: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   *(Alternatively: Under Security -> 2-Step Verification -> scroll to bottom and click "App passwords")*.
2. In the **App name** field, enter `Gym CRM Platform`.
3. Click **Create**.
4. A modal will display a 16-character password formatted in 4 groups of 4 letters (e.g., `abcd efgh ijkl mnop`).
5. Copy this 16-character string.
6. Set it in your `.env` file:
   ```env
   GMAIL_SMTP_USER="gymcrm.platform@gmail.com"
   GMAIL_SMTP_APP_PASSWORD="abcdefghijklmnop"
   ```
   *(Spaces may be omitted or included; the email service automatically strips whitespace).*

### Step 3: Quota and Guardrails
- Free Gmail accounts have an outbound SMTP quota of approximately **500 emails/day** (Google Workspace accounts have ~2,000/day).
- Gym CRM implements an internal daily quota limiter (default 100 emails per gym per day) to prevent a single tenant from exhausting the shared transport.
- When `GMAIL_SMTP_APP_PASSWORD` is omitted during local development, the `GmailSmtpProvider` gracefully logs receipt details to the development console instead of crashing.

---

## 4. Setup for Clerk Authentication

1. Create a free account at [Clerk.com](https://clerk.com).
2. Create a new Application called `Gym CRM`.
3. In the Clerk Dashboard under **API Keys**, copy:
   - `Publishable key` -> `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret key` -> `CLERK_SECRET_KEY`
4. Under **Webhooks**, add an endpoint:
   - Endpoint URL: `https://<YOUR_DOMAIN>/api/webhooks/clerk`
   - Subscribed events: `user.created`, `user.updated`, `user.deleted`, `invitation.accepted`, `invitation.revoked`
   - Copy the Signing Secret -> `CLERK_WEBHOOK_SIGNING_SECRET`

