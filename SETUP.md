# 🛡️ GigShield — MERN Stack Setup Guide

## Project Structure

```
gigshield/
├── server/                  # Node.js + Express Backend
│   ├── index.js             # Entry point
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # Mongoose models
│   │   ├── Worker.js
│   │   ├── Policy.js
│   │   ├── Claim.js
│   │   └── Trigger.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── workers.js
│   │   ├── policies.js
│   │   ├── claims.js
│   │   ├── triggers.js
│   │   └── analytics.js
│   └── middleware/
│       └── auth.js          # JWT middleware
│
├── client/                  # React Frontend
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css        # Global styles & design system
│       ├── context/
│       │   └── AuthContext.js
│       ├── utils/
│       │   └── api.js
│       ├── components/
│       │   └── Navbar/
│       └── pages/
│           ├── LandingPage.js
│           ├── LoginPage.js
│           ├── RegisterPage.js
│           ├── DashboardPage.js
│           ├── PolicyPage.js
│           ├── ClaimsPage.js
│           └── TriggersPage.js
│
├── package.json
├── .env.example
└── .gitignore
```

## Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 2. Clone & Install
```bash
git clone <your-repo>
cd gigshield
npm run install-all
```

### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env with your values:
# MONGO_URI=mongodb://localhost:27017/gigshield
# JWT_SECRET=your_secret_key
```

### 4. Run Development
```bash
npm run dev
# Backend:  http://localhost:5000
# Frontend: http://localhost:3000
```

### 5. Run Production Build
```bash
npm run build --prefix client
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register worker |
| POST | /api/auth/login | Login |
| GET  | /api/workers/profile | Get profile |
| POST | /api/policies | Create policy |
| GET  | /api/policies/my | Get my policies |
| POST | /api/claims | Submit claim |
| GET  | /api/claims/my | Get my claims |
| GET  | /api/triggers/live | Live trigger data |
| POST | /api/triggers/simulate | Simulate trigger |
| GET  | /api/analytics/dashboard | Dashboard data |

## Tech Stack
- **Frontend:** React 18, React Router v6, Recharts, React Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Payments:** Razorpay Sandbox (Phase 3)
- **APIs:** OpenWeatherMap, CPCB (mocked for Phase 1)
