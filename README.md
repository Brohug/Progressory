# Progressory

Progressory is a full-stack SaaS-style web application built for Brazilian Jiu-Jitsu academies to manage curriculum structure, class logging, attendance, member progression, staff accounts, reporting, and an internal gym library. Built with React, Node.js, Express, MySQL, JWT, and REST APIs, the app helps coaches stay aligned on what is taught while giving gym owners better visibility into curriculum consistency and student development.

---

## Features

### Curriculum Management
- Create and manage programs
- Create and manage curriculum topics
- Organize topics by parent/child relationship
- Track positions, concepts, techniques, drills, and more

### Class Logging
- Create class records by program, date, and time
- Attach curriculum topics to classes
- Attach training entries to classes
- Record teaching methods and scenarios used in class

### Attendance Tracking
- Add members to classes
- Track attendance status
- Remove attendance records when needed

### Member Progression
- Create and manage member records
- Track progression by curriculum topic
- Save notes and progression status such as:
  - not_started
  - introduced
  - developing
  - competent

### Reporting
- Recent classes report
- Topic coverage report
- Neglected topics report
- Training method usage report

### Gym Library
- Create internal gym library entries
- Link entries to programs and topics
- Store notes, drill ideas, concept entries, and video links
- Set entries as coach-only or member-visible

### Staff Management
- Owner-controlled staff account creation
- Create coach/admin accounts
- Deactivate staff accounts
- Safer separation between staff logins and tracked student members

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express

### Database
- MySQL

### Authentication
- JWT
- bcryptjs

---

## Database Setup

- For a fresh database, apply the base schema from `database/schema.sql`.
- For an existing environment, run the server migration runner before starting the app:
  - `cd server`
  - `npm run db:migrate`
- The migration runner prefers `server/database/migrations` for hosted server-only deploys such as Railway service roots, and falls back to the repo-level `database/migrations` path for local workspace runs.
- Production/runtime API requests should not need database `CREATE` or `ALTER` permissions once migrations are applied.

## Backend Environment Notes

- `ALLOWED_ORIGINS` should be set to a comma-separated list of allowed browser origins in hosted environments.
- Example:
  - `ALLOWED_ORIGINS=https://app.example.com,https://demo.example.com`
- In local development, if `ALLOWED_ORIGINS` is unset, the API remains permissive enough for browser testing.
- In production, if `ALLOWED_ORIGINS` is missing or empty, browser-origin requests are rejected while no-origin requests like `curl`, Postman, and server-to-server checks can still work.
- Public auth and invite endpoints are rate-limited.
- Public demo and founder requests are stored in `public_inquiries`.
- Optional owner notification env vars:
  - `OWNER_NOTIFICATION_EMAIL`
  - `RESEND_API_KEY`
  - `NOTIFICATION_FROM_EMAIL`
    - when configured, new demo/founder requests are emailed to the owner inbox
    - the same Resend configuration also lets `/platform-admin` email founder setup invites directly after provisioning or resend
- Optional platform operator env var:
  - `PLATFORM_ADMIN_EMAILS`
    - comma-separated allowlist for internal operator accounts that can access `/platform-admin`
- Optional tuning variables:
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_LOGIN_MAX`
  - `RATE_LIMIT_REGISTER_MAX`
  - `RATE_LIMIT_INVITE_ACCESS_MAX`
  - `RATE_LIMIT_OWNER_INVITE_MAX`
  - `RATE_LIMIT_DEV_MULTIPLIER`
- Billing V1 database scaffolding is gym-level.
- Planned billing environment variables:
  - `BILLING_STRIPE_MODE`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_FOUNDER_PRICE_ID`
  - `STRIPE_REGULAR_PRICE_ID`
  - `STRIPE_SUCCESS_URL`
  - `STRIPE_CANCEL_URL`
  - `STRIPE_CUSTOMER_PORTAL_RETURN_URL`
  - `BILLING_TRIAL_DAYS`
- Founder checkout uses `BILLING_TRIAL_DAYS` and collects a payment method up front without charging immediately.
- Regular checkout does not apply a trial by default and bills immediately through Stripe.
- Billing 8B uses Stripe test mode only.
- `BILLING_STRIPE_MODE` defaults to `test` when unset.
- Test mode requires `STRIPE_SECRET_KEY` to use `sk_test_...`.
- Live mode requires:
  - `BILLING_STRIPE_MODE=live`
  - `NODE_ENV=production`
  - `BILLING_ENFORCEMENT_ENABLED` not set to `false`
  - `STRIPE_SECRET_KEY` using `sk_live_...`
- Never commit real Stripe keys.
- Subscription status does not become active when checkout starts; that must still happen later through webhook sync.
- Billing 8C adds a Stripe webhook endpoint at:
  - `POST /api/billing/webhook`
- Local Stripe CLI testing example:
  - `stripe listen --forward-to localhost:4000/api/billing/webhook`
- Recommended webhook events to forward/listen for in this phase:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- `STRIPE_WEBHOOK_SECRET` should use the test webhook signing secret from Stripe CLI or the Stripe test dashboard.
- Billing 8D adds backend entitlement enforcement controlled by:
  - `BILLING_ENFORCEMENT_ENABLED`
- Default behavior:
  - production: billing enforcement is on if the env var is unset
  - development: billing enforcement is off if the env var is unset
- Do not copy `BILLING_ENFORCEMENT_ENABLED=false` into production.
- Even when enforcement is on, these recovery/checkout paths remain allowed:
  - `/api/auth/me`
  - `/api/auth/profile`
  - `/api/auth/change-password`
  - `/api/billing/subscription`
  - `/api/billing/access-status`
  - `/api/billing/checkout-session`
  - `/api/billing/customer-portal`

## Billing Deployment Notes

### Local test-mode setup

Use test mode by default:

```text
BILLING_STRIPE_MODE=test
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FOUNDER_PRICE_ID=price_...
STRIPE_REGULAR_PRICE_ID=price_...
STRIPE_SUCCESS_URL=http://localhost:5173/billing?checkout=success
STRIPE_CANCEL_URL=http://localhost:5173/billing?checkout=cancel
STRIPE_CUSTOMER_PORTAL_RETURN_URL=http://localhost:5173/billing
BILLING_TRIAL_DAYS=30
```

Stripe CLI example:

```powershell
stripe listen --forward-to localhost:4000/api/billing/webhook
```

### Production Railway backend env

At minimum, set:

```text
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app-domain.com
BILLING_STRIPE_MODE=live
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FOUNDER_PRICE_ID=price_...
STRIPE_REGULAR_PRICE_ID=price_...
STRIPE_SUCCESS_URL=https://your-app-domain.com/billing?checkout=success
STRIPE_CANCEL_URL=https://your-app-domain.com/billing?checkout=cancel
STRIPE_CUSTOMER_PORTAL_RETURN_URL=https://your-app-domain.com/billing
```

Recommended:
- leave `BILLING_ENFORCEMENT_ENABLED` unset in production so it defaults on
- only set `BILLING_ENFORCEMENT_ENABLED=true` if you need to be explicit

### Production Vercel frontend env

At minimum:

```text
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Stripe webhook setup

Production webhook endpoint:

```text
https://your-api-domain.com/api/billing/webhook
```

Required events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

### Live cutover checklist

1. Apply database schema and migrations.
2. Confirm `gym_subscriptions` and `billing_events` exist.
3. Set Railway backend env vars for:
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS`
   - `BILLING_STRIPE_MODE=live`
   - Stripe live keys and price IDs
4. Set `VITE_API_BASE_URL` on the frontend host.
5. Register the production Stripe webhook endpoint.
6. Confirm a founder checkout works in the live Stripe dashboard for a test internal gym.
7. Confirm a regular checkout works.
8. Confirm webhook delivery marks the gym `active` or `trialing`.
9. Confirm unpaid gyms are blocked from protected routes.
10. Confirm billing recovery routes still work for unpaid owners.

### Rollback steps

If billing live mode is misconfigured:
1. Remove or unset the bad Stripe env vars.
2. Set `BILLING_STRIPE_MODE=test` or remove it.
3. If needed, temporarily set `BILLING_ENFORCEMENT_ENABLED=false` in non-production only while diagnosing.
4. Re-deploy and verify `/api/billing/subscription` and `/api/billing/access-status`.
5. Re-enable correct production enforcement once Stripe configuration is fixed.

## Founder Lead Workflow

Recommended founder process:
1. A gym owner submits `Apply for founder access` or books a demo from the landing page.
2. The request is stored in `public_inquiries`.
3. If Resend notification env vars are configured, the request is also emailed to `OWNER_NOTIFICATION_EMAIL`.
4. You review the lead, talk with them, and decide whether to move forward.
5. Once approved, provision their gym owner invite manually:

```powershell
cd server
npm run leads:list
npm run leads:provision-founder -- <public_inquiry_id>
```

The provisioning script:
- creates the gym
- creates an inactive owner account
- creates a staff setup invite URL for that owner
- marks the founder inquiry as `provisioned`

Next:
1. Send the returned invite URL to the founder.
2. They set their password and log in.
3. They go to Billing and start founder checkout.
4. Stripe trial checkout and webhook sync grant access.
5. You onboard their first workflow manually inside their own gym environment.

## Platform Admin

Phase 1 adds a private operator view at `/platform-admin` for founder lead handling and gym oversight.

Access rules:
- users still authenticate through the normal login flow
- the backend adds `is_platform_admin` only when the user email is listed in `PLATFORM_ADMIN_EMAILS`
- non-allowlisted users cannot see or use the route, even if they try to visit it directly

Phase 1 actions:
- review all founder requests
- mark a founder request as contacted
  - provision a founder gym and owner invite
  - send a fresh founder invite email from the dashboard when Resend is configured
  - copy the raw invite URL manually when email delivery is not configured
  - review gym-level billing summary data
  - deactivate a gym when needed

## Internal Playbooks

- Founder operating playbook:
  - `docs/founder-operating-playbook.md`
  - use this for founder calls, approval decisions, follow-up messaging, onboarding, and first-week success tracking

---

## Project Structure

```text
client/
  src/
    api/
    components/
    context/
    pages/

server/
  src/
    config/
    controllers/
    middleware/
    routes/

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Classes Overview
![Classes Overview](screenshots/classes-overview.png)

### Class Management
![Class Management](screenshots/classes-manage.png)

### Members
![Members](screenshots/members.png)

### Staff
![Staff](screenshots/staff.png)

### Library
![Library](screenshots/library.png)

### Reports
![Reports](screenshots/reports.png)  
