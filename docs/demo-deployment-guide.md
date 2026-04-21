# Demo Deployment Guide

This guide is for giving a customer hands-on demo access without exposing local development URLs or real gym data.

## What already exists

- Demo tenant seed script: `server/scripts/seedDemoTenant.js`
- Demo seed command: `npm run seed:demo`
- Demo gym name: `Gem State Jiu Jitsu`
- Demo login email: `demo@progressory.app`
- Demo password source: `DEMO_PASSWORD` environment variable, falling back to the local script default if unset.

## Recommended setup

Use a separate demo database and separate hosted services:

- Demo database: Railway MySQL
- Demo API: Railway or Render running `server`
- Demo frontend: Vercel, Netlify, or Railway static hosting running `client`

Do not send a customer `localhost` URLs.

## Backend environment variables

Set these on the hosted API service:

```text
PORT=4000
CLIENT_URL=https://your-demo-frontend-url
CORS_ORIGIN=https://your-demo-frontend-url
DB_HOST=your-demo-mysql-host
DB_PORT=3306
DB_USER=your-demo-mysql-user
DB_PASSWORD=your-demo-mysql-password
DB_NAME=your-demo-mysql-database
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=8h
DEMO_PASSWORD=choose-a-customer-safe-demo-password
```

`CORS_ORIGIN` can be a comma-separated list if you need both a preview URL and a production demo URL.

## Frontend environment variables

Set this on the hosted frontend service:

```text
VITE_API_BASE_URL=https://your-demo-api-url/api
```

## Database setup

1. Create a fresh demo MySQL database.
2. Apply the schema from `database/schema.sql`.
3. Apply any needed migrations from `database/migrations`.
4. Run the demo seed against the demo database:

```powershell
cd server
$env:DEMO_PASSWORD='choose-a-customer-safe-demo-password'
npm run seed:demo
```

If running from a hosted shell, set `DEMO_PASSWORD` using that provider's environment variable UI instead.

## Deployment settings

Backend:

```text
Root directory: server
Build command: npm install
Start command: npm start
```

Frontend:

```text
Root directory: client
Build command: npm install && npm run build
Output directory: dist
```

## Customer login

Send only the frontend URL and the demo credentials:

```text
Demo URL: https://your-demo-frontend-url
Email: demo@progressory.app
Password: the DEMO_PASSWORD you set
```

## Safety checklist

- Use a demo database or demo tenant only.
- Confirm the frontend URL is public and the backend URL is not your local machine.
- Confirm `CORS_ORIGIN` points to the demo frontend URL.
- Confirm login shows `Gem State Jiu Jitsu`.
- Do not include real members, real customer data, or your owner account.
- Change `DEMO_PASSWORD` after the customer trial if needed.
