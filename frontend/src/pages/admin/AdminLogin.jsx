import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';
import ShieldIcon from '../../components/ShieldIcon';
import '../AuthPages.css';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  // Hardcoded admin credentials
  const ADMIN_EMAIL = 'admin@avaran.in';
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate a small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check demo credentials
      if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
        const adminData = {
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
          token: 'admin-token'
        };
        login(adminData);
        toast.success('Welcome to Admin Dashboard!');
        navigate('/admin/dashboard');
        return;
      }

      // Check registered admin accounts
      const registeredAdmins = JSON.parse(localStorage.getItem('avaran_registered_admins') || '[]');
      const adminAccount = registeredAdmins.find(
        a => a.email === form.email && a.password === form.password
      );

      if (adminAccount) {
        const adminData = {
          name: adminAccount.name,
          email: adminAccount.email,
          role: 'admin',
          token: 'admin-token-' + Date.now()
        };
        login(adminData);
        toast.success(`Welcome, ${adminAccount.name}!`);
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (err) {
      toast.error('Login failed');
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
