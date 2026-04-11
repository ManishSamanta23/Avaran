import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiFileText, FiBarChart2, FiMapPin, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import ShieldIcon from '../ShieldIcon';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAdminAuth();

  const links = [
    { path: '/admin/dashboard', label: 'Overview', icon: FiHome },
    { path: '/admin/workers', label: 'All Workers', icon: FiUsers },
    { path: '/admin/claims', label: 'Claims Management', icon: FiFileText },
    { path: '/admin/risk', label: 'Live Risk Map', icon: FiMapPin },
    { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/admin/settings', label: 'Settings', icon: FiSettings }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <ShieldIcon color="#FF6B35" size={24} />
        <h2>Avaran <span>Admin</span></h2>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
