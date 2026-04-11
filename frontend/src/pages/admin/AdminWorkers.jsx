import React, { useState, useEffect } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import './AdminPages.css';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('All Platforms');
  const [filterPlan, setFilterPlan] = useState('All Plans');

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workers, searchTerm, filterPlatform, filterPlan]);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/admin/workers');
      setWorkers(res.data || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = workers;

    // Search by name or phone
    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.phone?.includes(searchTerm)
      );
    }

    // Filter by platform
    if (filterPlatform !== 'All Platforms') {
      filtered = filtered.filter(w => w.platform === filterPlatform);
    }

    // Filter by plan - need to get from their policy
    if (filterPlan !== 'All Plans') {
      filtered = filtered.filter(w => w.activePlan === filterPlan);
    }

    setFilteredWorkers(filtered);
  };

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
          <h1>All Workers</h1>
          <p>Manage and monitor gig worker accounts</p>
        </div>

        {/* Search and Filters */}
        <div className="search-filter-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch size={18} />
          </div>
          <div className="filter-group">
            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
              <option value="All Platforms">All Platforms</option>
              <option value="Zepto">Zepto</option>
              <option value="Blinkit">Blinkit</option>
              <option value="Both">Both</option>
            </select>
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
              <option value="All Plans">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Max">Max</option>
            </select>
          </div>
        </div>

        {/* Workers Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Platform</th>
                <th>Zone/Pincode</th>
                <th>Active Plan</th>
                <th>Join Date</th>
                <th>Total Claims</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map(worker => (
                  <tr
                    key={worker._id}
                    onClick={() => setSelectedWorker(worker)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="worker-name">{worker.name}</td>
                    <td>{worker.phone}</td>
                    <td>{worker.platform}</td>
                    <td>{worker.pincode}</td>
                    <td>{worker.activePlan || 'None'}</td>
                    <td>{formatDate(worker.createdAt)}</td>
                    <td>{worker.totalClaims || 0}</td>
                    <td>
                      <span className="status-badge" style={{ background: 'rgba(0,196,159,0.2)', color: '#00C49F' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No workers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Worker Detail Panel */}
        {selectedWorker && (
          <div className="detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Worker Profile: {selectedWorker.name}</h3>
              <button
                onClick={() => setSelectedWorker(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <p className="detail-label">Name</p>
                <p className="detail-value">{selectedWorker.name}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Phone</p>
                <p className="detail-value">{selectedWorker.phone}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Email</p>
                <p className="detail-value">{selectedWorker.email || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Platform</p>
                <p className="detail-value">{selectedWorker.platform}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">City</p>
                <p className="detail-value">{selectedWorker.city}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Pincode</p>
                <p className="detail-value">{selectedWorker.pincode}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Avg Weekly Earnings</p>
                <p className="detail-value">₹{selectedWorker.avgWeeklyEarnings?.toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Avg Daily Hours</p>
                <p className="detail-value">{selectedWorker.avgDailyHours} hrs</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Risk Score</p>
                <p className="detail-value">{(selectedWorker.riskScore * 100).toFixed(0)}%</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Risk Zone</p>
                <p className="detail-value">
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: selectedWorker.riskZone === 'High' ? 'rgba(255,68,68,0.2)' : selectedWorker.riskZone === 'Medium' ? 'rgba(255,209,102,0.2)' : 'rgba(0,196,159,0.2)',
                    color: selectedWorker.riskZone === 'High' ? '#FF4444' : selectedWorker.riskZone === 'Medium' ? '#FFD166' : '#00C49F',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {selectedWorker.riskZone}
                  </span>
                </p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Join Date</p>
                <p className="detail-value">{formatDate(selectedWorker.createdAt)}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Total Claims</p>
                <p className="detail-value">{selectedWorker.totalClaims || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWorkers;
