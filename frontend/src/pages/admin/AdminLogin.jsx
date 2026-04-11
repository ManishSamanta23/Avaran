import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';
import ShieldIcon from '../../components/ShieldIcon';
import '../AuthPages.css';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Clear any existing admin session on mount
  useEffect(() => {
    logout();
    localStorage.removeItem('avaran_admin_token');
  }, [logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success('Welcome to Admin Dashboard!');
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card card">
        <div className="auth-logo">
          <ShieldIcon color="#FF6B35" size={32} />
          <h2>Avar<strong>an</strong></h2>
        </div>
        <h3>Admin Login</h3>
        <p className="auth-sub">Access the admin dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><FiMail size={12} /> Email</label>
            <input
              type="email"
              placeholder="admin@avaran.in"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label><FiLock size={12} /> Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
