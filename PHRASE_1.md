# Phase 2 Deliverables: Implementation Details

This document explains in detail how the 4 core points from the Phase 2 deliverables ("Automation & Protection") are utilized and executed within the GigShield platform.

## 1. Registration Process
The registration process is crucial for not only authenticating the Q-Commerce delivery partner but also initializing their baseline risk profile.
* **How it works:** When a worker signs up via the frontend (`frontend/src/pages/RegisterPage.jsx`), they submit critical details including their `platform`, `city`, and typical `working hours/earnings`.
* **Security & Profiling:** The backend API (`backend/routes/auth.js`) actively validates these payloads using strict **Zod schemas**. More importantly, the system assigns an immediate `riskScore` and `riskZone` (High/Medium/Low) based on the worker's city. For example, a worker from Mumbai receives a High risk score (`0.8`) due to historical flooding, while a worker from Bengaluru receives a Medium score (`0.55`). The worker is then issued a secure JWT session token containing these variables.

## 2. Insurance Policy Management
The policy management system is the core self-service portal for workers to manage their parametric insurance coverage.
* **How it works:** Our React frontend (`PolicyPage.jsx`, `UpgradePage.jsx`) provides a seamless interface connected to our Express backend (`backend/routes/policies.js`). 
* **Worker Capabilities:** Workers can effortlessly:
  * **View Plans:** Browse the curated Basic, Pro, and Max shields.
  * **Pause/Resume:** The system allows workers to securely `Pause` their coverage if they are off duty, flipping the MongoDB status away from `Active` to freeze their premiums.
  * **Upgrade:** In-place upgrades dynamically adjust their MongoDB policy document, expanding their `coverageEvents` array and increasing their maximum payout limit instantly.

## 3. Dynamic Premium Calculation
To satisfy the "AI Integration Example", the platform natively dynamically scales insurance premiums based on hyper-local risk assessment.
* **How it works:** Instead of hard-coding the weekly fees, the system pulls the worker's secure `riskScore` acquired during Registration.
* **The Engine:** In both the `PolicyPage.jsx` UI render and the backend purchase routes, a specialized pricing algorithm `calculatePremium(base, riskScore)` runs. The calculation adjusts the base pricing around a median score (0.55).
* **The Result:** If a significantly low-risk worker (`0.30`) browses the plans, they are automatically offered a customized **₹10/week discount**. Conversely, a high-risk worker (`0.80` from Mumbai) sees a **₹10/week surcharge**. The price they see is perfectly localized to them, making the platform financially viable while adhering to the hackathon's "Dynamic Pricing Modelling" constraint perfectly.

## 4. Claims Management (Zero-Touch Automation)
Parametric insurance requires that workers do not spend hours filling out manual damage forms. 
* **How it works:** The Claims Dashboard is designed for a frictionless, zero-touch experience. A worker selects an active claim event and submits their hours lost.
* **The Payout Formula:** The `backend/routes/claims.js` instantly calculates their exact payout based on their registered average earnings and specific plan ratio capping it to safe maximums.
* **Auto-Approval Safety Engine:** The backend utilizes the `currentWeatherMatchesTrigger()` helper to scan environmental values and verify if an event triggers the criteria. Before approving, a `getFraudScore()` logic evaluates the plausibility of their entered lost hours (e.g., scoring highly if they claim >12 hours in a single incident). 
* **The Result:** If the external parameters check out and the fraud score remains low, the claim is instantly forced into an `Auto-Approved` pipeline, skipping bureaucratic manual reviews entirely to initiate a direct UPI payout. 
