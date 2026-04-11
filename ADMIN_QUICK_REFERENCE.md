# Admin Dashboard - Quick Reference

## Access & Login

### Admin Login URL
```
http://localhost:3000/admin/login
```

### Credentials
```
Email: admin@avaran.in
Password: admin123
```

### Alternative Access
- From worker login page, click the small "Admin Login" link at the bottom

---

## Admin Routes Map

```
/admin/login              Admin login page
├─ /admin/dashboard      Dashboard (Overview & Stats)
├─ /admin/workers        Worker Management
├─ /admin/claims         Claims Management & Approval
├─ /admin/analytics      Analytics & Charts
├─ /admin/risk           Live Risk Map by Zone
└─ /admin/settings       System Configuration
```

---

## Dashboard Features

### 1. Dashboard Overview (`/admin/dashboard`)
**What you see**:
- 6 stat cards with key metrics
- Table of 10 most recent claims
- Color-coded fraud scores

**Key Metrics**:
- Total Workers
- Active Policies
- Claims This Week
- Payouts This Week
- Pending Review Claims
- Fraud Flagged Claims

---

### 2. Workers Management (`/admin/workers`)
**Capabilities**:
- View all registered workers
- Search by name or phone number
- Filter by platform (Zepto/Blinkit/Both)
- Filter by active plan (Basic/Pro/Max)
- Click any worker row to see detailed profile

**Worker Details Include**:
- Name, phone, email
- Platform & city
- Weekly earnings & daily hours
- Risk score & risk zone
- Account join date
- Total claims submitted

---

### 3. Claims Management (`/admin/claims`)
**Capabilities**:
- View all claims across all workers
- Filter by status (ALL, AUTO-APPROVED, UNDER REVIEW, APPROVED, REJECTED)
- Search by worker name
- Approve pending claims
- Reject pending claims

**Fraud Score Colors**:
- 🟢 Green: 0-20% (Low risk)
- 🟡 Amber: 21-50% (Medium risk)
- 🔴 Red: 51%+ (High risk)

**Quick Action**:
- For "Under Review" claims, use ✓ and ✗ buttons to approve/reject

---

### 4. Analytics (`/admin/analytics`)
**Charts Available**:
1. **Claims per Week** - Bar chart (last 8 weeks)
2. **Claims by Trigger Type** - Pie chart breakdown
3. **Payouts Over Time** - Line chart (12 weeks)
4. **Workers by Plan Tier** - Bar chart (Basic/Pro/Max distribution)

**Key Metrics**:
- Loss Ratio (Payouts / Premiums %)
- Total Payouts (₹)
- Most affected zones (Top 5)
- Most common trigger this month

---

### 5. Risk Map (`/admin/risk`)
**Zone Monitoring**:
- View all active zones by pincode
- Current temperature for each zone
- AQI (Air Quality Index)
- Number of active alerts
- Workers at risk count
- Risk level color indicator

**Risk Levels**:
- 🟢 **Low**: Temp < 35°C, AQI < 150
- 🟡 **Medium**: Temp 35-38°C or AQI 150-200
- 🔴 **High**: Temp > 38°C or AQI > 200

---

### 6. Settings (`/admin/settings`)
**Configurable Options**:

**Trigger Thresholds**:
- Heavy Rainfall threshold (mm/hr)
- Extreme Heat threshold (°C)
- Severe AQI threshold

**Auto-Approval**:
- Fraud score limit for auto-approval (%)

**Plan Pricing** (Weekly Premium in ₹):
- Basic plan price
- Pro plan price
- Max plan price

**Actions**:
- ✓ Save Settings - Apply changes across platform
- ↺ Reset to Defaults - Revert to original values

---

## Common Tasks

### Approve a Pending Claim
1. Go to `/admin/claims`
2. Click "UNDER REVIEW" tab
3. Find the claim
4. Click "✓ Approve" button

### Reject a Claim
1. Go to `/admin/claims`
2. Click "UNDER REVIEW" tab
3. Find the claim
4. Click "✗ Reject" button

### Find a Specific Worker
1. Go to `/admin/workers`
2. Enter name or phone in search box
3. Click on worker row to see full details

### View Zone Risk Information
1. Go to `/admin/risk`
2. Sort by Risk Level (High zones highlighted in red)
3. Check temperature and AQI values

### Update System Settings
1. Go to `/admin/settings`
2. Adjust threshold values
3. Update plan prices
4. Click "✓ Save Settings"

### Analyze Trends
1. Go to `/admin/analytics`
2. Review charts for patterns
3. Check loss ratio and top affected zones

---

## Data Refresh

- Dashboard updates automatically when you navigate
- All tables show **current data** from backend
- Analytics charts calculate based on **last 8-12 weeks**
- Settings use **localStorage** (persisted locally)

To refresh data: **reload the page** or navigate to a different admin section and back

---

## Logout

Click **"Logout"** button in admin sidebar footer:
- Returns to home page
- Clears admin session from localStorage
- Must log back in to access admin panel

---

## API Endpoints Used

**Admin-specific endpoints** (new):
- `GET /api/admin/workers` - All workers
- `GET /api/admin/policies` - All policies
- `GET /api/admin/claims` - All claims
- `PUT /api/admin/claims/:id/approve` - Approve claim
- `PUT /api/admin/claims/:id/reject` - Reject claim
- `GET /api/admin/stats` - Summary stats

All endpoints read from existing database models with no modifications needed.

---

## Browser Storage

Your admin session is stored locally:
- **Key**: `avaran_admin`
- **Location**: Browser's localStorage
- **Cleared**: On logout
- **Includes**: Admin name, email, role, token

Settings are stored separately:
- **Key**: `avaran_admin_settings`
- **Cleared**: On "Reset to Defaults"

---

## Tips & Tricks

- 🔍 **Search is case-insensitive** for worker names
- 📱 **Sidebar collapses** on mobile for more space
- 🎨 **Color coding** helps quickly identify issues:
  - Orange = Low activity, needs attention
  - Green = Good/Approved
  - Red = High risk/Rejected
- ✨ **Hover over elements** for better visual feedback
- 📊 **Charts are interactive** - hover to see exact values
- 🔄 **Settings persist** across sessions in localStorage

---

## Troubleshooting

**Can't log in?**
- Check email: `admin@avaran.in` (exact spelling)
- Check password: `admin123` (no spaces)
- Clear browser cache and try again

**Dashboard shows no data?**
- Ensure backend is running (`npm run server`)
- Check API responses in browser DevTools (F12)
- Verify database connection

**Settings not saving?**
- Check browser allows localStorage
- Try in incognito/private window
- Clear browser cache

**Charts not showing?**
- Wait for data to load (may take a few seconds)
- Check browser console for errors
- Refresh page

---

Last Updated: April 2026
Version: 1.0
