# Farmview Dashboard Frontend

React + TypeScript + Vite frontend for Advanced FMS.

This app connects to the backend API for:

- authentication and session handling
- daily farm records
- monthly reports and PDF export
- HR employee and transaction workflows
- tenant-aware access control for farm admins and superadmins
- farm creation, activation, and deletion flows for superadmins
- tenant settings and farm user management for admins

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS + Radix UI components
- shadcn/ui dialog, calendar, and form primitives
- Sonner toasts
- jsPDF + jspdf-autotable
- Vitest + Testing Library

## Prerequisites

- Node.js 18+
- npm
- Running backend API

## Environment

Create `.env` in this frontend folder:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Notes:

- Do not add trailing slash.
- App sends `credentials: include` for cookie auth.
- API client also sends `Authorization` header when `auth_token` exists in localStorage.

## Install

```bash
npm install
```

## Run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

Tests:

```bash
npm run test
```

Watch tests:

```bash
npm run test:watch
```

## App Routes

Public:

- `/login`
- `/subscription-expired`

Authenticated:

- `/records`
- `/records/:date`
- `/reports`
- `/contact`

Admin only:

- `/dashboard`
- `/records/update`
- `/records/update/existing`
- `/records/update/new`
- `/hr`
- `/settings`

Superadmin only:

- `/superadmin`
- `/superadmin/explore`

## Core Features

### Auth And Session

- Login with backend cookie session (`tId`)
- Protected route checks with `/api/auth/me`
- Role-based route access (`admin` vs user)
- Superadmins skip tenant selection at login and land on the dedicated Superadmin dashboard
- Inactive tenants can still sign in, but the app redirects them to a single subscription-expired screen and blocks the rest of the app
- The footer shows the subscription expiry label for farm-admin sessions

### Tenant Settings

- Admins can view tenant users by name and email
- Admins can add or delete tenant users from the Settings page
- Superadmin accounts are filtered out of the tenant settings list

### Daily Records

- Create and update records
- Date validation for new entries
- Detailed day view with milk, expenses, revenues, totals

### Monthly Reports

- Month selection and report table
- Aggregated monthly values
- Monthly summary (opening, net, closing)
- PDF export with entry table and detail sections

### HR Module

- Employee management
- Advance/payback transactions
- Settlement preview and execution
- Pay increases
- Mark employee as left
- Delete unsettled transactions with daily record and monthly report sync

### Superadmin Farm Management

- Dedicated Superadmin dashboard with mobile-friendly cards and summary stats
- Create farm tenants and admin credentials
- View and explore existing farms from the Superadmin area
- Toggle farm active state
- Activate a farm with a calendar date picker plus time selection dialog
- Delete a farm only after typed verification and a second confirmation popup
- Deactivate a farm immediately with one click

## HR Readonly Sync In Daily Logs

HR transactions are reflected in daily records and reports.

- HR advance appears as readonly expense line.
- HR payback appears as readonly revenue line.
- In update form, synced HR lines are shown in readonly sections.
- In record detail, source badges show `HR Read-only` vs `Manual`.
- Monthly report details include HR readonly labels.
- Deleting an unsettled HR transaction removes its synced readonly daily line and updates monthly totals.

Important:

- Admin can edit unsettled HR transactions from HR module.
- Daily record forms cannot directly edit HR readonly lines.
- Changes in HR unsettled transactions are synced to daily records by backend.

## Project Structure (High Level)

- `src/pages` route pages
- `src/components` shared and UI components
- `src/lib/api.ts` typed API methods
- `src/lib/apiClient.ts` base request client
- `src/hooks` shared hooks

## Troubleshooting

1. Login not persisting:
- Check backend CORS and `FRONTEND_ORIGIN`
- Ensure frontend uses correct `VITE_API_BASE_URL`
- Ensure browser allows cookies for backend domain

2. API errors for protected routes:
- Verify backend is running
- Verify session cookie exists after login

3. Report mismatch concerns:
- Backend now maintains incremental monthly consistency rebuild logic
- Re-open report after latest write actions

4. Subscription expired screen keeps showing:
- Confirm the tenant is marked active in the Superadmin dashboard
- Check the `inactiveUntil` expiry value for the farm tenant

