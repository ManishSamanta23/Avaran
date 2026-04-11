import React from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
