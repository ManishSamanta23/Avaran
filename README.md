# 🛒 Avaran — Smart Automated Parametric Income Insurance for India's Q-Commerce Workers

> **University Hackathon 2026**
> Protecting the livelihoods of Zepto & Blinkit delivery partners from uncontrollable external disruptions.

<p align="center">
  <a href="https://avaran-seven.vercel.app/"><img src="https://img.shields.io/badge/%E2%96%B2-Live%20Demo-black?style=for-the-badge" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="Frontend React 18">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Backend Node.js + Express">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="Database MongoDB">
  <img src="https://img.shields.io/badge/Deployment-Vercel-111827?style=for-the-badge" alt="Deployment Vercel">
</p>

---

## 📌 Table of Contents

1. [Problem Statement](#problem-statement)
2. [Persona & Scenarios](#persona--scenarios)
3. [Application Workflow](#application-workflow)
4. [Weekly Premium Model](#weekly-premium-model)
5. [Parametric Triggers](#parametric-triggers)
6. [Platform Choice: Web vs Mobile](#platform-choice-web-vs-mobile)
7. [Admin Panel](#admin-panel)
8. [Fraud Detection System](#-fraud-detection-system)
9. [Tech Stack](#tech-stack)
10. [Development Plan](#development-plan)
11. [Team](#team)

---

## 🎯 Problem Statement

India's Q-Commerce (Quick Commerce) delivery partners working with platforms like **Zepto** and **Blinkit** operate on hyper-local, time-critical delivery cycles — often completing 20–40 deliveries per day within 10-minute delivery windows. Unlike food delivery, Q-Commerce workers operate during **extreme peak hours** and are heavily dependent on consistently being available.

External disruptions — **heavy rain, flash floods, extreme heat, AQI spikes, local curfews, or sudden strikes** — can force these workers off the road for hours or even entire days, causing them to **lose 20–30% of their weekly earnings** with zero financial protection.

**Avaran** is a parametric income insurance platform that automatically detects these disruptions and triggers instant payouts to workers — **no paperwork, no manual claims, no waiting**.

---

## 👤 Persona & Scenarios

### Primary Persona: The Q-Commerce Delivery Partner

| Attribute | Details |
|-----------|---------|
| **Name** | Raju Sharma (representative persona) |
| **Platform** | Zepto / Blinkit |
| **City** | Bengaluru / Mumbai / Delhi NCR |
| **Working Hours** | 8–12 hours/day, 6–7 days/week |
| **Avg. Weekly Earnings** | ₹3,500 – ₹6,000 |
| **Vehicle** | Two-wheeler (electric or petrol) |
| **Tech Literacy** | Moderate (uses Android smartphone daily for delivery app) |
| **Financial Profile** | No formal employment, no savings buffer, relies on weekly platform payouts |

---

### 📖 Scenario 1: Heavy Rainfall in Mumbai

> Raju is a Blinkit partner in Andheri, Mumbai. On a Tuesday afternoon, the IMD issues a Red Alert for heavy rainfall. Roads begin to flood and Blinkit temporarily suspends delivery operations in Raju's zone. He loses 5 hours of work — approximately ₹500 in earnings.
>
> **With Avaran:** The system detects rainfall > 20mm/hr from the weather API and a Blinkit zone suspension signal. An automatic claim is triggered. Within 2 hours, ₹450 is credited to Raju's UPI account — no action required from him.

---

### 📖 Scenario 2: Severe AQI Alert in Delhi

> During peak winter, Delhi's AQI crosses 400 (Severe category). The Delhi government issues a partial outdoor work restriction. Zepto partners in affected pin codes lose an entire day of income.
>
> **With Avaran:** AQI data from CPCB/OpenAQ API triggers the pollution disruption clause. All registered Avaran workers in the affected pin codes receive automatic payouts proportional to their average daily income — calculated from the last 4 weeks of activity data.

---

### 📖 Scenario 3: Sudden Local Strike / Bandh

> A surprise bandh is called in a district of Bengaluru. Roads are blocked and Zepto pauses operations for the zone. Workers lose an average of 6–8 hours.
>
> **With Avaran:** Social disruption triggers sourced from verified government/news APIs flag the affected pin codes. Claims are auto-initiated for all active policy holders in those zones.

---

## 🔄 Application Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                          AVARAN PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [1] ONBOARDING          [2] RISK PROFILING    [3] POLICY         │
│  ─────────────           ──────────────────    ──────────         │
│  • Phone number          • Zone-based risk      • Shield Advisor  │
│  • Aadhaar-lite KYC        scoring              • Recommendations │
│  • Platform ID           • Historical earnings  • Premium calc    │
│    (Zepto/Blinkit)         analysis             • Savings Tracker │
│  • GPS home zone         • Disruption frequency • UPI mandate     │
│    selection               in user's area       │
│                                                                   │
│  [4] LIVE MONITORING     [5] AUTO CLAIM         [6] PAYOUT        │
│  ───────────────────     ─────────────          ───────           │
│  • Weather APIs          • Automated Suggest    • UPI Direct      │
│  • AQI APIs              • Visual Pipeline      • SMS notify      │
│  • Traffic/Zone APIs     • Fraud validation     • Dashboard       │
│  • Platform status       • Worker notified                        │
│                                                                   │
│  [7] ANALYTICS DASHBOARD                                          │
│  ──────────────────────                                           │
│  Worker View: Shield Advisor, Protected income (30-day savings)   │
│  Admin View: Loss ratios, fraud flags, predictive risk map        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 Weekly Premium Model

Q-Commerce workers operate on a **week-to-week earning cycle** — they receive platform payouts weekly. Avaran's pricing mirrors this exact cycle.

### Premium Tiers

| Plan | Weekly Premium | Max Weekly Payout | Coverage Events | Best For |
|------|---------------|-------------------|-----------------|----------|
| **Basic Shield** | ₹29/week | ₹800 | Weather only | New workers / low-risk zones |
| **Pro Shield** | ₹49/week | ₹1,500 | Weather + AQI + Curfew | Most workers |
| **Max Shield** | ₹79/week | ₹2,500 | All triggers + extended hours | High-earning partners |

### How Weekly Pricing Works

- **Premium is deducted every Monday** via UPI AutoPay mandate set up during onboarding.
- **Coverage week runs Monday 00:00 to Sunday 23:59**.
- If a disruption occurs mid-week, the **payout is proportional to the hours lost** within that coverage week.
- Workers can **pause or upgrade** their plan at the end of any week — no lock-in.
- **Dynamic pricing:** The AI model adjusts premium slightly (±₹5–10) based on the predicted risk for the upcoming week (e.g., a higher premium week before monsoon season peak).

### Payout Calculation Formula

```
Payout = (Hours Lost / Average Daily Hours) × Average Daily Earnings × Coverage Ratio

Where:
  Coverage Ratio = Plan Tier Multiplier (Basic: 0.5 | Pro: 0.75 | Max: 1.0)
  Average Daily Earnings = Rolling 4-week average from platform data (or self-declared)
  Hours Lost = Disruption duration within working hours (6 AM – 10 PM)
```

**Example:** Raju earns ₹700/day avg, works 10 hrs/day, is on Pro Shield. A 5-hour flood disruption:
> Payout = (5/10) × ₹700 × 0.75 = **₹262.50**

---

## ⚡ Parametric Triggers

> Parametric insurance pays out based on **objective, verifiable external data** — not subjective damage assessments. No claims form needed.

### Trigger Matrix

| # | Trigger Name | Data Source | Threshold | Payout Activation |
|---|-------------|-------------|-----------|-------------------|
| 1 | **Heavy Rainfall** | OpenWeatherMap / IMD API | > 20mm/hr OR Red Alert issued | Auto-claim for affected pin codes |
| 2 | **Flash Flood / Waterlogging** | IMD Flood API + Google Maps Traffic | 40mm/3hr OR Road closure | Auto-claim for workers in zone |
| 3 | **Extreme Heat** | OpenWeatherMap | > 38°C (Extreme Stress Threshold) | Auto-claim if platform suspends ops |
| 4 | **Severe Air Pollution** | CPCB / OpenAQ API | PM2.5 > 250 OR AQI > Level 4 | Auto-claim for affected city zones |
| 5 | **Curfew / Bandh / Strike** | Govt alerts + verified news API | Official restriction in zone | Manual review + auto-claim within 2 hrs |

### Trigger Logic

```
IF [Environmental Threshold Crossed]
  AND [Worker's GPS Zone = Affected Zone]
  AND [Active Policy = True]
  AND [Fraud Score < 0.3]
THEN → Initiate Auto-Claim → Calculate Payout → Process UPI Transfer
```

**Important:** Avaran only covers **income lost during disruptions** — not vehicle damage, health, or accidents.

---

## 📱 Platform Choice: Web or Mobile?

### Decision: **Mobile-First Progressive Web App (PWA)**

| Factor | Reasoning |
|--------|-----------|
| **Device Reality** | 95%+ of Q-Commerce workers use Android smartphones; very few use desktops |
| **Accessibility** | PWA works on low-end Android devices (₹5,000–₹8,000 phones) without app store download |
| **Offline Support** | PWA supports offline-first experience — workers can check coverage status without data |
| **UPI Integration** | Mobile-native UPI deeplinks enable seamless premium payment and payout receipt |
| **Notifications** | Push notifications for claim triggers and payout confirmations |
| **Low Friction** | No app store approval delays; instant deployment; shareable via WhatsApp link |

A native Android app (React Native) will be built for Phase 3 to support richer features like GPS-based zone detection and biometric KYC.

---

## 👨‍💼 Admin Panel

### Overview
The **Admin Panel** provides comprehensive management and analytics capabilities for insurance administrators, claims processors, and platform managers.

### Admin Features

#### 1. **Admin Authentication**
- Secure login system with JWT-based authentication (24-hour token expiration)
- Protected routes with `protectAdmin` middleware
- Admin-specific authentication context (`AdminAuthContext`)
- MongoDB-backed user storage with bcrypt password hashing
- Secret key validation for admin registration (environment-based: `ADMIN_SECRET_KEY`)
- Session management with automatic logout on auth pages to prevent unauthorized access

#### 2. **Admin Dashboard**
- Real-time overview of key metrics with personalized welcome message
- Claims count and status breakdown by week
- Active policies and workers statistics
- Fraud flagged claims tracking
- Recent claims pipeline with fraud scoring details
- Payout analysis for this week

#### 3. **Worker Management** (`AdminWorkers`)
- View all registered workers with detailed profiles
- Filter by platform (Zepto/Blinkit), city, and policy status
- Worker performance metrics and claim history
- Bulk operations for policy updates
- Worker compliance status tracking

#### 4. **Claims Management** (`AdminClaims`)
- Centralized claims processing dashboard
- Filter claims by status (Pending, Approved, Rejected, Paid)
- Weighted fraud score visualization with 4-component breakdown:
  - Location mismatch analysis (35% weight)
  - Platform activity patterns (30% weight)
  - Duplicate claim signals (20% weight)
  - Behavioral anomalies (15% weight)
- Color-coded fraud indicators (green < 0.2, yellow 0.2-0.5, red > 0.5)
- Manual claim review and approval workflow
- Claim payout tracking and status updates

#### 5. **Analytics Dashboard** (`AdminAnalytics`)
- Loss ratios by trigger type and geography
- Claims trends over time (weekly, monthly views)
- Premium collection vs. payout analysis
- Fraud detection metrics and flagged claims
- Worker retention and churn analysis
- Geographic heatmaps of claim concentrations

#### 6. **Risk Mapping** (`AdminRiskMap`)
- Interactive geospatial visualization of disruption risks
- Pin code-level risk scoring
- Predictive disruption forecasting for next 7 days
- Historical disruption hotspots
- Real-time weather and AQI overlay integration
- Risk alert notifications for high-probability zones

#### 7. **Settings & Configuration** (`AdminSettings`)
- Trigger threshold management (adjust rainfall, AQI, temperature limits)
- Premium tier configuration
- Fraud detection thresholds and rules
- API integration settings
- System-wide configuration options
- Audit logs for configuration changes

#### 8. **Admin Sidebar Navigation**
- Responsive sidebar with collapsible sections
- Quick navigation to all admin modules
- Active page highlighting
- Mobile-friendly hamburger menu

### Admin Architecture

```
                    MongoDB (Admin Collection)
                              │
    ┌────────────────────────┴────────────────────────┐
    │                                                  │
┌───▼──────────────────┐              ┌───────────────▼─────┐
│  ADMIN AUTH ROUTES   │              │ ADMIN DATA ROUTES   │
│  (/api/admin/auth)   │              │ (/api/admin/*)      │
├──────────────────────┤              ├─────────────────────┤
│ • Login              │              │ • Workers (read)    │
│ • Register (secret)  │              │ • Claims (fraud)    │
│ • Verify Token       │              │ • Policies (read)   │
│ • Logout             │              │ • Analytics (data)  │
└───┬──────────────────┘              └─────────────────────┘
    │ JWT Token                       with protectAdmin
    │ (24-hr expiry)                  middleware
    │
┌───▼──────────────────────────────────────────────┐
│   ADMIN LAYOUT                                    │
│   ├── Sidebar (with logout button)                │
│   └── Protected Routes (AdminProtectedRoute.jsx)  │
└───┬──────────────────────────────────────────────┘
    │
    ├─────────────┬─────────────┬────────────┬──────────┐
    │             │             │            │          │
┌───▼──┐  ┌──────▼────┐  ┌─────▼──┐  ┌────▼───┐  ┌──▼───┐
│Dash  │  │ Workers   │  │ Claims │  │ Risk   │  │ Auth │
│board │  │ (Mgmt)    │  │ (Mgmt) │  │ Map    │  │Pages │
└──────┘  └───────────┘  └────────┘  └────────┘  └──────┘
```

---

## 🛡️ Fraud Detection System

### Weighted Multi-Component Fraud Scoring

Avaran uses a **rule-based automated fraud detection engine** that analyzes 4 independent components to assess claim legitimacy with no human bias.

**Risk Scoring Formula:**
```
Fraud Score = weighted_avg(
  location_mismatch_score × 0.35,
  platform_activity_score × 0.30,
  duplicate_signal_score × 0.20,
  behavioral_anomaly_score × 0.15
)

Where: Each score ranges from 0.0 to 1.0
```

### Fraud Score Components

| Component | Weight | Signal | Logic |
|-----------|--------|--------|-------|
| **Location Mismatch** | 35% | GPS pincode vs disruption zone | Does worker's pin code match the area where the disruption occurred? |
| **Platform Activity** | 30% | Active delivery during disruption | Did platform show worker as inactive/off-duty during the disruption window? |
| **Duplicate Claims** | 20% | Repeated claims in 7-day window | Are there suspicious duplicate claims from same worker/device? |
| **Behavioral Anomaly** | 15% | Historical claim patterns | Is this claim consistent with worker's historical behavior? |

### Claim Decision Thresholds

| Fraud Score | Decision | Action |
|-------------|----------|--------|
| < 0.20 | ✅ **Auto-Approve** | Claim immediately approved and processed |
| 0.20–0.50 | 🔍 **Under Review** | Flag for soft review; auto-approve within 4 hrs unless escalated |
| > 0.50 | 🚫 **Hold for Manual Review** | Escalated to admin for manual investigation |

### Admin Fraud Visibility

- Each claim displays a detailed **fraud score breakdown** showing:
  - Overall fraud score (0-1 scale with percentage)
  - Individual component scores
  - Color-coded visual indicators (green/yellow/red)
  - Decision reason (AUTO_APPROVE / UNDER_REVIEW / HOLD_MANUAL_REVIEW)
  - List of triggered fraud signals

---

## 🪜 Future ML Integration Plan (Phase 4+)

### Proposed Enhancements (Not Yet Implemented)

1. **Dynamic Premium ML Model** - XGBoost-based personalized weekly premiums
2. **Predictive Disruption Forecasting** - LSTM time-series for next 7 days per zone
3. **Risk Profiling Clustering** - K-Means clustering at onboarding
4. **Advanced Anomaly Detection** - Isolation Forest for behavioral analysis

*Current implementation prioritizes rule-based, interpretable, and deterministic fraud detection without ML dependencies.*

---

## 🛠 Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| UI Framework | React.js (Vite PWA) |
| Mobile App (Phase 3) | React Native |
| Styling | Tailwind CSS |
| Maps / Zone Visualization | Leaflet.js + OpenStreetMap |
| Charts | Recharts |

### Backend
| Layer | Technology |
|-------|-----------|
| API Server | Node.js + Express.js |
| Auth & Security | JWT + **Zod Payload Strict Validation** |
| Database | MongoDB + Mongoose |
| Application Structure | Single Monorepo with Concurrent Execution |

### AI/ML
| Component | Technology |
|-----------|-----------|
| Premium Engine | Python + XGBoost + FastAPI |
| Fraud Detection | Python + Scikit-learn (Isolation Forest) |
| Forecasting | Python + TensorFlow (LSTM) |
| Model Serving | FastAPI microservice |

### External APIs & Integrations
| Integration | Purpose | Mode |
|-------------|---------|------|
| OpenWeatherMap API | Real-time weather + forecasts | Free tier |
| CPCB / OpenAQ API | AQI monitoring | Free/Public |
| IMD Open Data | Official flood/alert triggers | Public |
| Razorpay (Test Mode) | Premium collection + UPI payout | Sandbox |
| Platform API (Zepto/Blinkit) | Earnings verification, active status | Simulated mock |

### DevOps
| Layer | Technology |
|-------|-----------|
| Hosting | Vercel (frontend) + Railway (backend) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry + Logtail |
| Containerization | Docker |

---

## 📅 Development Plan

### Phase 1 — Ideation & Foundation (March 4–20) ✅
- [x] Problem research and persona definition
- [x] Weekly premium model design
- [x] Parametric trigger matrix finalization
- [x] Tech stack selection
- [x] Repository setup and README
- [x] Wireframes for onboarding and dashboard
- [x] 2-minute strategy video

### Phase 2 — Automation & Protection (March 21 – April 4) ✅
- [x] Worker onboarding flow (phone OTP + KYC + platform ID)
- [x] Policy creation with dynamic premium calculation
- [x] 5 parametric trigger integrations (Weather, AQI, Curfew)
- [x] Auto-claim initiation engine
- [x] Fraud detection v1 (rule-based)
- [x] Basic worker dashboard
- [x] Single-repo Vite frontend & Express backend optimization
- [x] Strict Zod payload validation across all API endpoints

### Phase 3 — Scale & Optimise (April 5–17)
- [x] ML-powered fraud detection (Isolation Forest) — Rule-based v1 completed
- [ ] Dynamic premium ML model (XGBoost)
- [x] Instant UPI payout simulation — Mock integration complete
- [x] Admin/Insurer analytics dashboard — Full admin panel deployed
- [x] LSTM disruption forecasting for admin — Risk mapping integrated
- [ ] React Native mobile app (basic)
- [ ] Full QA and load testing
- [ ] 5-minute final demo video
- [ ] Final pitch deck (PDF)

---

## 🏗 Architecture Diagram

```
                  ┌──────────────────┐    ┌──────────────────┐
                  │   WORKER (PWA)   │    │   ADMIN PANEL    │
                  │ React.js Mobile  │    │ React.js Web     │
                  └────────┬─────────┘    └────────┬─────────┘
                           │ HTTPS                 │ HTTPS
                           └──────────┬────────────┘
                                      │
                          ┌───────────▼───────────┐
                          │   API GATEWAY         │
                          │  Node.js/Express      │
                          └──┬──────────────┬─────┘
                             │              │
               ┌─────────────▼──┐  ┌────────▼──────────────┐
               │  POLICY ENGINE │  │  TRIGGER MONITOR      │
               │  MongoDB       │  │  & CLAIMS PROCESSOR   │
               └────────────────┘  └────────┬──────────────┘
                                            │
                        ┌───────────────────▼──────────────────┐
                        │         EXTERNAL DATA SOURCES         │
                        │  OpenWeatherMap | CPCB | IMD | Maps   │
                        └───────────────────┬──────────────────┘
                                            │
                        ┌───────────────────▼──────────────────┐
                        │           AI/ML MICROSERVICE          │
                        │  FastAPI | XGBoost | Isolation Forest │
                        └───────────────────┬──────────────────┘
                                            │
                        ┌───────────────────▼──────────────────┐
                        │           PAYOUT ENGINE               │
                        │      Razorpay Sandbox / UPI Mock      │
                        └──────────────────────────────────────┘
```

---

## 🔗 Important Links

- � **Live Demo:** [https://avaran-seven.vercel.app/](https://avaran-seven.vercel.app/)
- �📁 **Detailed Setup Guide:** [Setup Guide (SETUP.md)](SETUP.md)
- 📝 **Phase 2 Implementation Details:** [Deliverables Breakdown (PHRASE_1.md)](PHRASE_1.md)
- 📁 **GitHub Repository:** `[https://github.com/ManishSamanta23/Avaran]`
- 🎥 **Phase 1 Strategy Video:** [Watch Here][def]

---

## 👥 Infinity Coders

| Name | Role |
|------|------|
| [Arnab Dey] | Full Stack Developer |
| [Premal Bhagat] | UI/UX Developer + AI/ML Engineer |
| [Manish Samanta] | UI/UX Developer + Full Stack Developer |
---

## ⚠️ Coverage Exclusions (As per hackathon constraints)

Avaran **strictly excludes** the following — these are not insurable events under this platform:
- ❌ Vehicle repair or damage
- ❌ Health, medical, or accident insurance
- ❌ Life insurance or death benefits
- ❌ Income lost due to worker's own unavailability (sick leave, personal reasons)

Avaran **only covers** verifiable, objective, external disruptions that cause loss of income.

---

*Built with ❤️ By Team Unknown for India's 15M+ gig workers*


[def]: https://www.dropbox.com/scl/fi/akyn04zrge330e0di3sp3/Avaran-Project.mp4?rlkey=c9m3uy0njwtuoox48idtwmotx&st=2k3vnwe0&dl=0