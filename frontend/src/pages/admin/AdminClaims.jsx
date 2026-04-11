import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import './AdminPages.css';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const statuses = ['ALL', 'AUTO-APPROVED', 'UNDER REVIEW', 'APPROVED', 'REJECTED'];

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [claims, statusFilter, searchTerm]);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/admin/claims');
      setClaims(res.data || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = claims;

    // Filter by status
    if (statusFilter !== 'ALL') {
      const statusMap = {
        'AUTO-APPROVED': 'Auto-Approved',
        'UNDER REVIEW': 'Under Review',
        'APPROVED': 'Approved',
        'REJECTED': 'Rejected'
      };
      filtered = filtered.filter(c => c.status === statusMap[statusFilter]);
    }

    // Search by worker name
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.workerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClaims(filtered);
  };

  const handleApproveClaim = async (claimId) => {
    setActionLoading(claimId);
    try {
      await api.put(`/admin/claims/${claimId}/approve`);
      // Update local state
      setClaims(claims.map(c =>
        c._id === claimId ? { ...c, status: 'Approved' } : c
      ));
    } catch (err) {
      console.error('Error approving claim:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClaim = async (claimId) => {
    setActionLoading(claimId);
    try {
      await api.put(`/admin/claims/${claimId}/reject`);
      // Update local state
      setClaims(claims.map(c =>
        c._id === claimId ? { ...c, status: 'Rejected' } : c
      ));
    } catch (err) {
      console.error('Error rejecting claim:', err);
    } finally {
      setActionLoading(null);
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

  const getFraudBarColor = (score) => {
    if (score > 0.5) return '#FF4444';
    if (score > 0.2) return '#FFD166';
    return '#00C49F';
  };

  const formatCurrency = (val) => '₹' + val.toLocaleString();
  const formatDate = (date) => new Date(date).toLocaleDateString();

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
          <h1>Claims Management</h1>
          <p>Review and manage all worker claims</p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                border: statusFilter === status ? '2px solid var(--orange)' : '1px solid var(--card-border)',
                background: statusFilter === status ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                color: statusFilter === status ? 'var(--orange)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="search-filter-group" style={{ marginBottom: '24px' }}>
          <div className="search-input-wrapper">
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Search by worker name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Claims Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Trigger Type</th>
                <th>Date</th>
                <th>Hours Lost</th>
                <th>Payout (₹)</th>
                <th>Status</th>
                <th>Fraud Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length > 0 ? (
                filteredClaims.map(claim => (
                  <tr key={claim._id}>
                    <td className="worker-name">{claim.workerName || 'N/A'}</td>
                    <td>{claim.triggerType}</td>
                    <td>{formatDate(claim.claimDate)}</td>
                    <td>{claim.hoursLost}h</td>
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
                            background: getFraudBarColor(claim.fraudScore)
                          }}
                        />
                        <span className="fraud-text">{Math.round(claim.fraudScore * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      {claim.status === 'Under Review' && (
                        <div className="btn-group">
                          <button
                            className="btn-small btn-approve"
                            onClick={() => handleApproveClaim(claim._id)}
                            disabled={actionLoading === claim._id}
                          >
                            {actionLoading === claim._id ? '...' : '✓ Approve'}
                          </button>
                          <button
                            className="btn-small btn-reject"
                            onClick={() => handleRejectClaim(claim._id)}
                            disabled={actionLoading === claim._id}
                          >
                            {actionLoading === claim._id ? '...' : '✗ Reject'}
                          </button>
                        </div>
                      )}
                      {claim.status !== 'Under Review' && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No claims found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminClaims;
