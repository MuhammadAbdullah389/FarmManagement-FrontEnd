# Farmview Dashboard Frontend

React + TypeScript + Vite frontend for Advanced FMS.

This app connects to the backend API for:

- authentication and session handling
- daily farm records
- monthly reports and PDF export
- HR employee and transaction workflows

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS + Radix UI components
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

## Core Features

### Auth And Session

- Login with backend cookie session (`tId`)
- Protected route checks with `/api/auth/me`
- Role-based route access (`admin` vs user)

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

## HR Readonly Sync In Daily Logs

HR transactions are reflected in daily records and reports.

- HR advance appears as readonly expense line.
- HR payback appears as readonly revenue line.
- In update form, synced HR lines are shown in readonly sections.
- In record detail, source badges show `HR Read-only` vs `Manual`.
- Monthly report details include HR readonly labels.

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

