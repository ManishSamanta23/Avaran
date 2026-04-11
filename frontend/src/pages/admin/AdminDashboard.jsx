import React, { useState, useEffect } from 'react';
import { FiUsers, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiClock, FiFlag } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import './AdminPages.css';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="admin-stat-card card">
    <div className="stat-icon" style={{ background: `${color}18`, color }}>
      <Icon size={24} />
    </div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {sub && <p className="stat-sub">{sub}</p>}
      {trend && <p className="stat-trend" style={{ color }}>{trend}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activePolicies: 0,
    claimsThisWeek: 0,
    payoutsThisWeek: 0,
    pendingReviewClaims: 0,
    fraudFlaggedClaims: 0
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all stats needed for dashboard
      const workersRes = await api.get('/admin/workers');
      const claimsRes = await api.get('/admin/claims');
      const policiesRes = await api.get('/admin/policies');

      const workers = workersRes.data || [];
      const claims = claimsRes.data || [];
      const policies = policiesRes.data || [];

      // Calculate stats
      const now = new Date();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const claimsThisWeek = claims.filter(c => new Date(c.claimDate) >= weekStart);
      const payoutsThisWeek = claimsThisWeek
        .filter(c => ['Auto-Approved', 'Approved', 'Paid'].includes(c.status))
        .reduce((sum, c) => sum + c.payoutAmount, 0);

      const pendingReview = claims.filter(c => c.status === 'Under Review');
      const fraudFlagged = claims.filter(c => c.fraudScore >= 0.5);

      setStats({
        totalWorkers: workers.length,
        activePolicies: policies.filter(p => p.status === 'Active').length,
        claimsThisWeek: claimsThisWeek.length,
        payoutsThisWeek,
        pendingReviewClaims: pendingReview.length,
        fraudFlaggedClaims: fraudFlagged.length
      });

      // Get last 10 claims
      setRecentClaims(claims.sort((a, b) => new Date(b.claimDate) - new Date(a.claimDate)).slice(0, 10));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    const colors = {
      'Auto-Approved': '#00C49F',
      'Approved': '#00C49F',
      'Paid': '#00C49F',
      'Under Review': '#FFD166',
      'Pending': '#4A90E2',
      'Rejected': '#FF4444'
    };
    return colors[status] || '#999';
  };

  const formatCurrency = (val) => '₹' + val.toLocaleString();

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #FF6B35', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header-section">
          <h1>Admin Dashboard</h1>
          <p>Overview of platform activity and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard icon={FiUsers} label="Total Workers" value={stats.totalWorkers} color="#FF6B35" />
          <StatCard icon={FiTrendingUp} label="Active Policies" value={stats.activePolicies} color="#00C49F" />
          <StatCard icon={FiCheckCircle} label="Claims This Week" value={stats.claimsThisWeek} color="#4A90E2" />
          <StatCard icon={FiTrendingUp} label="Payouts This Week" value={formatCurrency(stats.payoutsThisWeek)} color="#FFD166" />
          <StatCard icon={FiClock} label="Pending Review" value={stats.pendingReviewClaims} color="#FF8C5A" />
          <StatCard icon={FiFlag} label="Fraud Flagged" value={stats.fraudFlaggedClaims} color="#FF4444" />
        </div>

        {/* Recent Claims Section */}
        <div className="dashboard-section">
          <h2>Recent Claims</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Trigger Type</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Fraud Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.length > 0 ? (
                  recentClaims.map(claim => (
                    <tr key={claim._id}>
                      <td className="worker-name">{claim.workerName || 'N/A'}</td>
                      <td>{claim.triggerType}</td>
                      <td>{formatCurrency(claim.payoutAmount)}</td>
                      <td>
                        <span className="status-badge" style={{ background: `${statusColor(claim.status)}18`, color: statusColor(claim.status) }}>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        <div className="fraud-score-bar">
                          <div
                            className="fraud-fill"
                            style={{
                              width: `${Math.min(claim.fraudScore * 100, 100)}%`,
                              background: claim.fraudScore > 0.5 ? '#FF4444' : claim.fraudScore > 0.2 ? '#FFD166' : '#00C49F'
                            }}
                          />
                          <span className="fraud-text">{Math.round(claim.fraudScore * 100)}%</span>
                        </div>
                      </td>
                      <td>{new Date(claim.claimDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No claims found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
