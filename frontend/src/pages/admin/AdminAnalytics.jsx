import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { FiAlertTriangle } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import './AdminPages.css';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const claimsRes = await api.get('/admin/claims');
      const policiesRes = await api.get('/admin/policies');
      const workersRes = await api.get('/admin/workers');

      const claims = claimsRes.data || [];
      const policies = policiesRes.data || [];
      const workers = workersRes.data || [];

      // Prepare data for charts

      // 1. Claims per week (last 8 weeks)
      const weeklyClaimsData = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekClaims = claims.filter(c => {
          const claimDate = new Date(c.claimDate);
          return claimDate >= weekStart && claimDate < weekEnd;
        });

        weeklyClaimsData.push({
          week: `W${8 - i}`,
          claims: weekClaims.length,
          payout: weekClaims
            .filter(c => ['Auto-Approved', 'Approved', 'Paid'].includes(c.status))
            .reduce((sum, c) => sum + c.payoutAmount, 0)
        });
      }

      // 2. Claims by trigger type
      const triggerCounts = {};
      claims.forEach(c => {
        triggerCounts[c.triggerType] = (triggerCounts[c.triggerType] || 0) + 1;
      });

      const triggerData = Object.entries(triggerCounts).map(([name, value]) => ({
        name,
        value
      }));

      // 3. Payouts over time (last 12 weeks)
      const payoutData = [];
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekPayouts = claims
          .filter(c => {
            const claimDate = new Date(c.claimDate);
            return claimDate >= weekStart && claimDate < weekEnd && ['Auto-Approved', 'Approved', 'Paid'].includes(c.status);
          })
          .reduce((sum, c) => sum + c.payoutAmount, 0);

        payoutData.push({
          week: `W${12 - i}`,
          payout: weekPayouts
        });
      }

      // 4. Workers by plan tier
      const planCounts = { Basic: 0, Pro: 0, Max: 0 };
      policies.forEach(p => {
        if (p.plan && p.status === 'Active') {
          planCounts[p.plan] = (planCounts[p.plan] || 0) + 1;
        }
      });

      const planData = [
        { plan: 'Basic', count: planCounts.Basic },
        { plan: 'Pro', count: planCounts.Pro },
        { plan: 'Max', count: planCounts.Max }
      ];

      // Calculate key metrics
      const approvedClaims = claims.filter(c => ['Auto-Approved', 'Approved', 'Paid'].includes(c.status));
      const totalPayouts = approvedClaims.reduce((sum, c) => sum + c.payoutAmount, 0);
      const totalPremiums = policies.reduce((sum, p) => sum + (p.totalPremiumPaid || 0), 0);
      const lossRatio = totalPremiums > 0 ? (totalPayouts / totalPremiums * 100).toFixed(1) : 0;

      // Most affected zones
      const zoneCounts = {};
      workers.forEach(w => {
        zoneCounts[w.pincode] = (zoneCounts[w.pincode] || 0) + 1;
      });

      const topZones = Object.entries(zoneCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pincode, count]) => ({ pincode, claims: count }));

      // Most common trigger this month
      const thisMonth = new Date();
      thisMonth.setDate(1);

      const monthlyTriggers = {};
      claims
        .filter(c => new Date(c.claimDate) >= thisMonth)
        .forEach(c => {
          monthlyTriggers[c.triggerType] = (monthlyTriggers[c.triggerType] || 0) + 1;
        });

      const mostCommonTrigger = Object.entries(monthlyTriggers).sort((a, b) => b[1] - a[1])[0];

      setAnalyticsData({
        weeklyClaimsData,
        triggerData,
        payoutData,
        planData,
        lossRatio,
        topZones,
        mostCommonTrigger: mostCommonTrigger ? mostCommonTrigger[0] : 'N/A',
        totalPayouts,
        totalPremiums
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#FF6B35', '#00C49F', '#FFD166', '#4A90E2', '#FF8C5A'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #FF6B35', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </AdminLayout>
    );
  }

  if (!analyticsData) {
    return (
      <AdminLayout>
        <div className="admin-page">
          <div className="admin-header-section">
            <h1>Analytics</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>No data available</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header-section">
          <h1>Analytics & Insights</h1>
          <p>Platform performance and claim trends</p>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Claims per Week */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Claims per Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.weeklyClaimsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="claims" fill="#FF6B35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Claims by Trigger Type */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Claims by Trigger Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.triggerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.triggerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payouts Over Time */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Payouts Over Time (₹)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.payoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="payout" stroke="#00C49F" strokeWidth={2} dot={{ fill: '#00C49F', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Workers by Plan */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Workers by Plan Tier</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.planData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="plan" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="count" fill="#4A90E2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="stats-grid">
          <div className="admin-stat-card card">
            <div className="stat-icon" style={{ background: 'rgba(0, 196, 159, 0.2)', color: '#00C49F' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>%</span>
            </div>
            <div className="stat-content">
              <p className="stat-label">Loss Ratio</p>
              <h3 className="stat-value">{analyticsData.lossRatio}%</h3>
              <p className="stat-sub">Payouts / Premiums Collected</p>
            </div>
          </div>

          <div className="admin-stat-card card">
            <div className="stat-icon" style={{ background: 'rgba(255, 107, 53, 0.2)', color: '#FF6B35' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹</span>
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Payouts</p>
              <h3 className="stat-value">₹{(analyticsData.totalPayouts / 1000).toFixed(1)}k</h3>
              <p className="stat-sub">All approved claims</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '40px' }}>
          {/* Top Zones */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Top Affected Zones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analyticsData.topZones.map((zone, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pincode {zone.pincode}</span>
                  <span style={{ fontWeight: '600', color: 'var(--white)' }}>{zone.claims} claims</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Common Trigger */}
          <div className="card" style={{
            padding: '32px 24px',
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)',
            border: '1.5px solid rgba(255, 107, 53, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = '1.5px solid rgba(255, 107, 53, 0.4)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 107, 53, 0.08) 100%)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1.5px solid rgba(255, 107, 53, 0.2)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: 0, fontSize: '16px', fontWeight: '700', color: 'var(--white)' }}>Most Common Trigger</h3>
              <FiAlertTriangle size={20} color="#FF6B35" />
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#FF6B35',
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(255, 107, 53, 0.08)',
              borderRadius: '12px',
              letterSpacing: '-0.5px',
              textTransform: 'uppercase'
            }}>
              {analyticsData.mostCommonTrigger}
            </div>
            <div style={{
              marginTop: '16px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              This Month
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
