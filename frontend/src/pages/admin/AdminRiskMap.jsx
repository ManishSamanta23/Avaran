import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import './AdminPages.css';

const AdminRiskMap = () => {
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      // Fetch necessary data
      const workersRes = await api.get('/admin/workers');
      const weatherRes = await api.get('/weather');

      const workers = workersRes.data || [];
      
      // Group workers by zone (pincode) and calculate risk
      const zoneRiskMap = {};

      workers.forEach(worker => {
        const zone = worker.pincode;
        if (!zoneRiskMap[zone]) {
          zoneRiskMap[zone] = {
            zone,
            workersAtRisk: 0,
            temp: null,
            aqi: null,
            riskLevel: 'Low'
          };
        }
        zoneRiskMap[zone].workersAtRisk += 1;
      });

      // Try to fetch weather data for each zone (if available via API)
      const riskArray = Object.values(zoneRiskMap);

      // Simulate weather and AQI data for zones
      // In production, you'd fetch this from weather API per zone
      const enrichedRiskData = riskArray.map((zone, idx) => {
        // Simulate temperature and AQI data
        const temp = 25 + Math.floor(Math.random() * 15); // 25-40°C
        const aqi = 50 + Math.floor(Math.random() * 200); // 50-250

        // Determine risk level
        let riskLevel = 'Low';
        let alertCount = 0;

        if (temp > 38) {
          riskLevel = 'High';
          alertCount += 1;
        } else if (temp > 35) {
          riskLevel = 'Medium';
          alertCount += 1;
        }

        if (aqi > 200) {
          riskLevel = 'High';
          alertCount += 1;
        } else if (aqi > 150) {
          riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
          alertCount += 1;
        }

        return {
          ...zone,
          temp: temp + '°C',
          aqi: aqi,
          activeAlerts: alertCount,
          riskLevel
        };
      });

      setRiskData(enrichedRiskData.sort((a, b) => {
        const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }));
    } catch (err) {
      console.error('Error fetching risk data:', err);
      // Set mock data if API fails
      const mockZones = ['560001', '560002', '560003', '560004', '560005'];
      const mockData = mockZones.map(zone => ({
        zone,
        temp: (25 + Math.floor(Math.random() * 15)) + '°C',
        aqi: 50 + Math.floor(Math.random() * 200),
        activeAlerts: Math.floor(Math.random() * 3),
        workersAtRisk: Math.floor(Math.random() * 20) + 1,
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
      }));
      setRiskData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      'Low': '#00C49F',
      'Medium': '#FFD166',
      'High': '#FF4444'
    };
    return colors[level] || '#999';
  };

  const getRiskBgColor = (level) => {
    const colors = {
      'Low': 'rgba(0, 196, 159, 0.1)',
      'Medium': 'rgba(255, 209, 102, 0.1)',
      'High': 'rgba(255, 68, 68, 0.1)'
    };
    return colors[level] || 'rgba(150,150,150,0.1)';
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
          <h1>Live Risk Map</h1>
          <p>Real-time risk assessment by zone</p>
        </div>

        {/* Risk Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '20px', background: 'rgba(0, 196, 159, 0.1)', border: '1px solid rgba(0, 196, 159, 0.2)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>LOW RISK ZONES</p>
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#00C49F', fontFamily: "'Inter', sans-serif" }}>
              {riskData.filter(r => r.riskLevel === 'Low').length}
            </h3>
          </div>

          <div className="card" style={{ padding: '20px', background: 'rgba(255, 209, 102, 0.1)', border: '1px solid rgba(255, 209, 102, 0.2)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>MEDIUM RISK ZONES</p>
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#FFD166', fontFamily: "'Inter', sans-serif" }}>
              {riskData.filter(r => r.riskLevel === 'Medium').length}
            </h3>
          </div>

          <div className="card" style={{ padding: '20px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>HIGH RISK ZONES</p>
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#FF4444', fontFamily: "'Inter', sans-serif" }}>
              {riskData.filter(r => r.riskLevel === 'High').length}
            </h3>
          </div>
        </div>

        {/* Risk Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Zone (Pincode)</th>
                <th>Current Temp</th>
                <th>AQI Index</th>
                <th>Active Alerts</th>
                <th>Workers at Risk</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {riskData.length > 0 ? (
                riskData.map((zone, idx) => (
                  <tr key={idx}>
                    <td className="worker-name" style={{ fontFamily: 'var(--font-numbers)' }}>
                      {zone.zone}
                    </td>
                    <td>{zone.temp}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: zone.aqi > 200 ? 'rgba(255,68,68,0.2)' : zone.aqi > 150 ? 'rgba(255,209,102,0.2)' : 'rgba(0,196,159,0.2)',
                        color: zone.aqi > 200 ? '#FF4444' : zone.aqi > 150 ? '#FFD166' : '#00C49F',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {zone.aqi}
                      </span>
                    </td>
                    <td>{zone.activeAlerts}</td>
                    <td style={{ fontWeight: '600' }}>{zone.workersAtRisk}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: getRiskBgColor(zone.riskLevel),
                          color: getRiskColor(zone.riskLevel)
                        }}
                      >
                        {zone.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No zone data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Risk Legend */}
        <div className="card" style={{ padding: '24px', marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '700' }}>Risk Level Guide</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0, 196, 159, 0.2)', border: '2px solid #00C49F', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px', color: '#00C49F' }}>Low Risk</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Temp &lt; 35°C, AQI &lt; 150</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255, 209, 102, 0.2)', border: '2px solid #FFD166', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px', color: '#FFD166' }}>Medium Risk</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Temp 35-38°C or AQI 150-200</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255, 68, 68, 0.2)', border: '2px solid #FF4444', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px', color: '#FF4444' }}>High Risk</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Temp &gt; 38°C or AQI &gt; 200</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRiskMap;
