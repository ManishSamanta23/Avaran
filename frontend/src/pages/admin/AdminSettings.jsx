import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import './AdminPages.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // Trigger thresholds
    rainfallThreshold: 50,
    heatThreshold: 40,
    aqiThreshold: 200,
    // Auto-approval settings
    autoApprovalFraudLimit: 20,
    // Plan prices
    planBasicPrice: 29,
    planProPrice: 49,
    planMaxPrice: 79
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('avaran_admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage
      localStorage.setItem('avaran_admin_settings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaults = {
      rainfallThreshold: 50,
      heatThreshold: 40,
      aqiThreshold: 200,
      autoApprovalFraudLimit: 20,
      planBasicPrice: 29,
      planProPrice: 49,
      planMaxPrice: 79
    };
    setSettings(defaults);
    toast.success('Reset to default values');
  };

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
          <h1>Settings</h1>
          <p>Configure system thresholds and plan pricing</p>
        </div>

        {/* Settings Form */}
        <div className="card" style={{ padding: '32px', maxWidth: '800px' }}>

          {/* Trigger Thresholds Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
              Trigger Detection Thresholds
            </h2>

            <div className="form-group">
              <label htmlFor="rainfallThreshold">
                Heavy Rainfall Threshold (mm/hr)
              </label>
              <input
                id="rainfallThreshold"
                type="number"
                name="rainfallThreshold"
                value={settings.rainfallThreshold}
                onChange={handleInputChange}
                min="0"
                step="1"
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Rainfall intensity that triggers claims coverage
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="heatThreshold">
                Extreme Heat Threshold (°C)
              </label>
              <input
                id="heatThreshold"
                type="number"
                name="heatThreshold"
                value={settings.heatThreshold}
                onChange={handleInputChange}
                min="0"
                step="1"
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Temperature that triggers extreme heat coverage
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="aqiThreshold">
                Severe AQI Threshold
              </label>
              <input
                id="aqiThreshold"
                type="number"
                name="aqiThreshold"
                value={settings.aqiThreshold}
                onChange={handleInputChange}
                min="0"
                max="500"
                step="1"
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Air Quality Index level that triggers coverage
              </p>
            </div>
          </div>

          {/* Auto-Approval Settings */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
              Auto-Approval Settings
            </h2>

            <div className="form-group">
              <label htmlFor="autoApprovalFraudLimit">
                Fraud Score Limit for Auto-Approval (%)
              </label>
              <input
                id="autoApprovalFraudLimit"
                type="number"
                name="autoApprovalFraudLimit"
                value={settings.autoApprovalFraudLimit}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="1"
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Claims with fraud score below this will be auto-approved (if other criteria met)
              </p>
            </div>
          </div>

          {/* Plan Pricing */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
              Plan Pricing (Weekly Premium in ₹)
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="planBasicPrice">
                  Basic Plan Weekly Premium
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                  <input
                    id="planBasicPrice"
                    type="number"
                    name="planBasicPrice"
                    value={settings.planBasicPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="planProPrice">
                  Pro Plan Weekly Premium
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                  <input
                    id="planProPrice"
                    type="number"
                    name="planProPrice"
                    value={settings.planProPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="planMaxPrice">
                  Max Plan Weekly Premium
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                  <input
                    id="planMaxPrice"
                    type="number"
                    name="planMaxPrice"
                    value={settings.planMaxPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-primary"
              style={{
                padding: '12px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving ? 'Saving...' : '✓ Save Settings'}
            </button>

            <button
              onClick={handleResetToDefaults}
              style={{
                padding: '12px 28px',
                background: 'transparent',
                border: '1px solid var(--card-border)',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.border = '1px solid var(--orange)';
                e.target.style.color = 'var(--orange)';
                e.target.style.background = 'rgba(255,107,53,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.border = '1px solid var(--card-border)';
                e.target.style.color = 'var(--text-muted)';
                e.target.style.background = 'transparent';
              }}
            >
              ↺ Reset to Defaults
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="card" style={{ padding: '24px', marginTop: '32px', background: 'rgba(255, 107, 53, 0.05)', border: '1px solid rgba(255, 107, 53, 0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#FF6B35' }}>
            📋 Configuration Guide
          </h3>
          <ul style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)', marginLeft: '20px' }}>
            <li><strong style={{ color: 'var(--white)' }}>Trigger thresholds:</strong> Adjust sensitivity of automated claim detection</li>
            <li><strong style={{ color: 'var(--white)' }}>Fraud score limit:</strong> Higher value = more claims auto-approved (risk with false positives)</li>
            <li><strong style={{ color: 'var(--white)' }}>Plan pricing:</strong> Adjust weekly premiums (note: prices are riskadjusted per worker)</li>
            <li><strong style={{ color: 'var(--white)' }}>Changes:</strong> Save to apply immediately across the platform</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
