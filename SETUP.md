# Avaran - MERN Stack Setup Guide

This repository is a single-root MERN project with:
- React + Vite frontend in `frontend/`
- Express + MongoDB backend in `backend/`
- Vercel serverless API entry in `api/index.js`

## Project Structure

```
avaran/
|- api/                      # Serverless API wrapper
|  `- index.js               # Exports backend app for Vercel
|
|- backend/                  # Node.js + Express backend
|  |- index.js               # Main backend entry point
|  |- config/
|  |  `- db.js               # MongoDB connection config
|  |- middleware/
|  |  `- auth.js             # JWT auth middleware
|  |- models/                # Mongoose data models
|  |  |- Admin.js
|  |  |- Claim.js
|  |  |- Policy.js
|  |  |- Trigger.js
|  |  `- Worker.js
|  |- routes/                # API route handlers
|  |  |- admin.js
|  |  |- adminAuth.js
|  |  |- analytics.js
|  |  |- auth.js
|  |  |- claims.js
|  |  |- policies.js
|  |  |- triggers.js
|  |  |- weather.js
|  |  `- workers.js
|  `- utils/                 # Business logic utilities
|     |- autoApprovalEngine.js
|     `- fraudScoringEngine.js
|
|- frontend/                 # Vite + React frontend
|  |- index.html             # Vite HTML entry
|  `- src/
|     |- App.jsx
|     |- index.css
|     |- index.jsx
|     |- components/         # Shared UI components
|     |  |- ShieldIcon.jsx
|     |  |- Navbar/
|     |  |  |- Navbar.css
|     |  |  `- Navbar.jsx
|     |  `- admin/
|     |     |- AdminLayout.css
|     |     |- AdminLayout.jsx
|     |     |- AdminProtectedRoute.jsx
|     |     |- AdminSidebar.css
|     |     `- AdminSidebar.jsx
|     |- context/            # React auth contexts
|     |  |- AdminAuthContext.jsx
|     |  `- AuthContext.jsx
|     |- pages/              # App screens
|     |  |- AuthPages.css
|     |  |- ClaimsPage.css
|     |  |- ClaimsPage.jsx
|     |  |- DashboardPage.css
|     |  |- DashboardPage.jsx
|     |  |- LandingPage.css
|     |  |- LandingPage.jsx
|     |  |- LoginPage.jsx
|     |  |- PolicyPage.css
|     |  |- PolicyPage.jsx
|     |  |- RegisterPage.jsx
|     |  |- TriggersPage.css
|     |  |- TriggersPage.jsx
|     |  |- UpgradePage.css
|     |  |- UpgradePage.jsx
|     |  `- admin/
|     |     |- AdminAnalytics.jsx
|     |     |- AdminClaims.jsx
|     |     |- AdminDashboard.jsx
|     |     |- AdminLogin.jsx
|     |     |- AdminPages.css
|     |     |- AdminRegister.jsx
|     |     |- AdminRiskMap.jsx
|     |     |- AdminSettings.jsx
|     |     `- AdminWorkers.jsx
|     `- utils/              # Frontend utility helpers
|        |- api.jsx
|        |- geolocation.jsx
|        `- weather.jsx
|
|- package.json              # Root scripts and dependencies
|- vite.config.js            # Vite config (frontend root + proxy)
|- vercel.json               # Vercel rewrite configuration
|- README.md                 # Project overview
`- SETUP.md                  # Local setup instructions
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Install

```bash
npm install
```

## Environment Setup

Create a `.env` file at the project root:

```bash
MONGO_URI=mongodb://localhost:27017/avaran
JWT_SECRET=replace_with_strong_secret
ADMIN_SECRET_KEY=replace_with_admin_secret
OPENWEATHER_API_KEY=your_openweather_api_key
PORT=5000
```

## Run Locally

### Development (frontend + backend together)

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Individual Scripts

```bash
npm run client   # Vite frontend
npm run server   # Nodemon backend
npm run start    # Node backend (without nodemon)
npm run build    # Build frontend to dist/
```

## API Route Groups

Mounted route groups in backend:
- `POST/GET /api/auth/*`
- `GET/PUT /api/workers/*`
- `POST/GET/PUT /api/policies/*`
- `POST/GET /api/claims/*`
- `POST/GET /api/triggers/*`
- `GET /api/analytics/*`
- `GET /api/weather/*`
- `POST/GET /api/admin/*` (admin auth + admin operations)

## Deployment Note

- `api/index.js` re-exports the Express app for serverless environments.
- `vercel.json` rewrites `/api/*` requests to `api/index.js`.
