import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';
import { 
  Wallet, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Target,
  Download // Added Download icon
} from 'lucide-react';
import './AdminRevenue.css';

const AdminRevenue = () => {
  const [revenue, setRevenue] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [rawPayments, setRawPayments] = useState([]);

  useEffect(() => {
    const paymentsRef = ref(db, 'payments');
    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const paymentList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setRawPayments(paymentList);
      calculateRevenue(paymentList);
    });

    return () => unsubscribe();
  }, []);

  const calculateRevenue = (paymentList) => {
    const now = new Date();
    let daily = 0, monthly = 0, yearly = 0;

    paymentList.forEach((p) => {
      if (p.status !== 'approved') return;
      const created = new Date(p.createdAt);
      if (created.toDateString() === now.toDateString()) daily += p.amount;
      if (created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) monthly += p.amount;
      if (created.getFullYear() === now.getFullYear()) yearly += p.amount;
    });

    setRevenue({ daily, monthly, yearly });
  };

  // CSV Download Logic
  // CSV Download Logic
const downloadReport = (type) => {
    const now = new Date();
    const filteredData = rawPayments.filter((p) => {
      if (p.status !== 'approved') return false;
      const created = new Date(p.createdAt);
      
      if (type === 'daily') return created.toDateString() === now.toDateString();
      if (type === 'monthly') return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      if (type === 'yearly') return created.getFullYear() === now.getFullYear();
      return false;
    });
  
    // Create CSV content with Email instead of ID
    const csvHeader = "Email,Date,Amount,Status\n";
    const csvRows = filteredData.map(p => 
      `${p.userEmail},${new Date(p.createdAt).toLocaleDateString()},${p.amount},${p.status}`
    ).join("\n");
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${type}_revenue_report_${now.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const targets = { monthly: 50000, yearly: 500000 };
  const monthlyProgress = Math.min((revenue.monthly / targets.monthly) * 100, 100);

  return (
    <div className="revenue-grid">
      {/* Daily Revenue Card */}
      <div className="revenue-card daily">
        <div className="revenue-card-header">
          <div className="header-left">
            <div className="revenue-icon-wrapper">
              <Wallet size={20} />
            </div>
            <span className="revenue-tag">Today</span>
          </div>
          <button className="download-btn" onClick={() => downloadReport('daily')} title="Download Daily CSV">
            <Download size={16} />
          </button>
        </div>
        <div className="revenue-card-body">
          <span className="revenue-label">Daily Earnings</span>
          <h3 className="revenue-amount">₱{revenue.daily.toLocaleString()}</h3>
          <div className="revenue-trend positive">
            <TrendingUp size={14} />
            <span>Live updates</span>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Card */}
      <div className="revenue-card monthly">
        <div className="revenue-card-header">
          <div className="header-left">
            <div className="revenue-icon-wrapper">
              <Calendar size={20} />
            </div>
            <span className="revenue-tag">Month</span>
          </div>
          <button className="download-btn" onClick={() => downloadReport('monthly')} title="Download Monthly CSV">
            <Download size={16} />
          </button>
        </div>
        <div className="revenue-card-body">
          <span className="revenue-label">Monthly Revenue</span>
          <h3 className="revenue-amount">₱{revenue.monthly.toLocaleString()}</h3>
          <div className="progress-container">
            <div className="progress-label">
              <span>Goal Progress</span>
              <span>{Math.round(monthlyProgress)}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${monthlyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Revenue Card */}
      <div className="revenue-card yearly">
        <div className="revenue-card-header">
          <div className="header-left">
            <div className="revenue-icon-wrapper">
              <BarChart3 size={20} />
            </div>
            <span className="revenue-tag">Year</span>
          </div>
          <button className="download-btn" onClick={() => downloadReport('yearly')} title="Download Yearly CSV">
            <Download size={16} />
          </button>
        </div>
        <div className="revenue-card-body">
          <span className="revenue-label">Yearly Total</span>
          <h3 className="revenue-amount">₱{revenue.yearly.toLocaleString()}</h3>
          <div className="revenue-stats">
            <div className="revenue-stat-item">
              <Target size={14} />
              <span>Target: ₱{targets.yearly.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;