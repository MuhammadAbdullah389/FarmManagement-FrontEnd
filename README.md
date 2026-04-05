# Advanced FMS Frontend

React + Vite frontend for the Advanced Farm Management System.

## Run Locally

1. Install dependencies:
	npm install
2. Configure environment:
	copy .env.example .env
3. Start development server:
	npm run dev

## API Configuration

Set VITE_API_BASE_URL in .env to your backend host.

Example:
VITE_API_BASE_URL=http://localhost:3000

The app uses fetch-based API services for:
- Authentication (/api/login, /api/logout)
- Daily records (/api/records, /api/records/:date, /api/records/check-date/:date)
- Reports (/api/reports/:month/:year, /api/reports/:month/:year/pdf)
