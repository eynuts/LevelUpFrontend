import React, { useState, useEffect } from 'react';
import { Wallet, Users, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // State for quick metrics
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Load Users and Payments data from Firebase
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTotalUsers(Object.keys(data).length);
    });

    const paymentsRef = ref(db, 'payments');
    const unsubscribePayments = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const paymentList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      
      // Pending payments count
      const pendingCount = paymentList.filter(p => p.status === 'pending').length;
      setPendingPayments(pendingCount);

      // Total revenue from approved payments
      const revenueSum = paymentList
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      setTotalRevenue(revenueSum);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePayments();
    };
  }, []);

  // Quick metric cards data
  const stats = [
    {
      title: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString()}`,
      icon: <Wallet size={20} />,
      color: 'green',
      growth: '+0.0%',
      isPositive: true
    },
    {
      title: 'Pending Payments',
      value: pendingPayments,
      icon: <Clock size={20} />,
      color: 'orange',
      growth: '-0.0%',
      isPositive: false
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: <Users size={20} />,
      color: 'blue',
      growth: '+0.0%',
      isPositive: true
    }
  ];

  // ✅ Download CSV report function
  const handleDownloadReport = () => {
    const reportData = [];
  
    const usersRef = ref(db, 'users');
    const paymentsRef = ref(db, 'payments');
  
    // Step 1: Load all users first
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      
      // Step 2: Load all payments
      onValue(paymentsRef, (snap) => {
        const payments = snap.val() || {};
  
        // Add users to report
        Object.keys(users).forEach((uid) => {
          reportData.push({
            type: 'User',
            id: uid,
            name: users[uid].name || '',
            email: users[uid].email || '',
            role: users[uid].role || 'user',
            createdAt: users[uid].createdAt || ''
          });
        });
  
        // Add payments to report and include user name
        Object.keys(payments).forEach((pid) => {
          const payment = payments[pid];
          const userName = users[payment.userId]?.name || 'Unknown';
          const userEmail = users[payment.userId]?.email || '';
          reportData.push({
            type: 'Payment',
            id: pid,
            userId: payment.userId || '',
            userName: userName,  // ✅ Attach user name
            userEmail: userEmail, // optional
            amount: payment.amount || 0,
            status: payment.status || '',
            createdAt: payment.createdAt || ''
          });
        });
  
        if (reportData.length === 0) {
          alert('No data available to download.');
          return;
        }
  
        // Convert to CSV
        const csvHeaders = Object.keys(reportData[0]).join(',');
        const csvRows = reportData.map(row =>
          Object.values(row).map(val => `"${val}"`).join(',')
        );
        const csvContent = [csvHeaders, ...csvRows].join('\n');
  
        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `admin_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, { onlyOnce: true });
    }, { onlyOnce: true });
  };
  
  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <div className="dashboard-welcome">
        <div>
          <h2>Welcome, Admin</h2>
          <p>Here’s a quick overview of your platform.</p>
        </div>
        <div className="dashboard-actions">
          <select className="date-filter">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last Year</option>
          </select>
          <button className="download-report" onClick={handleDownloadReport}>
            Download Report
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-card-top">
              <div className={`icon-box ${stat.color}`}>{stat.icon}</div>
              <span className={`growth-tag ${stat.isPositive ? 'positive' : 'negative'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.growth}
              </span>
            </div>
            <div className="stat-card-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
