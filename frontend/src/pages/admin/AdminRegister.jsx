import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiKey } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';
import ShieldIcon from '../../components/ShieldIcon';
import '../AuthPages.css';

const AdminRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, logout } = useAdminAuth();
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
      // Validate secret key
      if (!form.secretKey) {
        toast.error('Admin secret key is required');
        setLoading(false);
        return;
      }

      // Validate passwords match
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate password length
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      await register(form.name, form.email, form.password, form.confirmPassword, form.secretKey);
      toast.success('Admin account created successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      console.error('Registration error:', err);
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
        <h3>Admin Registration</h3>
        <p className="auth-sub">Create an admin account</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><FiUser size={12} /> Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label><FiMail size={12} /> Email</label>
            <input
              type="email"
              placeholder="your.email@avaran.in"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label><FiLock size={12} /> Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label><FiLock size={12} /> Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label><FiKey size={12} /> Admin Secret Key</label>
            <input
              type="password"
              placeholder="Enter admin secret key"
              value={form.secretKey}
              onChange={e => setForm({ ...form, secretKey: e.target.value })}
              required
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Contact platform admin for secret key
            </p>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/admin/login" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: '600' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
