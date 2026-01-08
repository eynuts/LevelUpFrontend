import React, { useState, useContext, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  LogOut, 
  Menu,
  Bell,
  BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

// Import child components
import AdminDashboard from './AdminDashboard';
import AdminPayment from './AdminPayment';
import AdminUser from './AdminUser';
import AdminRevenue from './AdminRevenue';

// Firebase
import { db } from './firebase';
import { ref, get } from 'firebase/database';

// USER CONTEXT
import { UserContext } from './UserContext';

const Admin = () => {
  const { user } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  // State for user info
  const [userData, setUserData] = useState({ name: '', photoURL: '', role: 'user' });

  // 🔒 Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load user data from Firebase
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData({
            name: data.name || user.displayName || 'No Name',
            photoURL: data.photoURL || '',
            role: data.role || 'user'
          });

          // 🔒 Redirect if user is not admin
          if (data.role !== 'admin') {
            navigate('/');
          }
        } else {
          // If somehow user exists but no database entry, redirect
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        navigate('/');
      }
    };

    loadUserData();
  }, [user, navigate]);

  // Exit button (go back to Home)
  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">A</div>
          <span className="brand-name">AdminPanel</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="nav-label">Main Menu</p>
            <button 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveSection('revenue')}
            >
              <BarChart2 size={20} />
              <span>Revenue</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveSection('payments')}
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              <Users size={20} />
              <span>Users</span>
            </button>
          </div>

          <div className="nav-group secondary">
            <p className="nav-label">System</p>
            <button className="nav-item logout" onClick={handleExit}>
              <LogOut size={20} />
              <span>Exit</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="admin-wrapper">
        <header className="admin-header">
          <div className="header-left">
            <Menu className="mobile-only" />
            <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="avatar">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="Avatar" className="avatar-img" />
                ) : (
                  userData.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="user-name">{userData.name}</span>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <div className="content-container">
            {activeSection === 'dashboard' && <AdminDashboard />}
            {activeSection === 'revenue' && <AdminRevenue />}
            {activeSection === 'payments' && <AdminPayment />}
            {activeSection === 'users' && <AdminUser />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
