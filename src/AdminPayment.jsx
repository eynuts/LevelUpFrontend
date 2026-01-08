import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, update, onValue } from 'firebase/database';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink
} from 'lucide-react';
import './AdminPayment.css';

const AdminPayment = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'denied'

  // 🔹 Load payments from Firebase
  useEffect(() => {
    const paymentsRef = ref(db, 'payments');
    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const paymentList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setPayments(paymentList);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Send email notification through NodeMailer server
  const sendEmail = async (userEmail, action, referenceNumber, amount) => {
    try {
      await fetch('https://levelupbackend-elb9.onrender.com/send-payment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, action, referenceNumber, amount }),
      });
    } catch (err) {
      console.error('Error sending email:', err);
    }
  };

  // 🔹 Approve payment
  const approvePayment = async (id, userEmail, referenceNumber, amount) => {
    try {
      await update(ref(db, `payments/${id}`), { status: 'approved' });
      await sendEmail(userEmail, 'approved', referenceNumber, amount);
    } catch (err) {
      console.error('Error approving payment:', err);
    }
  };

  // 🔹 Deny payment
  const denyPayment = async (id, userEmail, referenceNumber, amount) => {
    try {
      await update(ref(db, `payments/${id}`), { status: 'denied' });
      await sendEmail(userEmail, 'denied', referenceNumber, amount);
    } catch (err) {
      console.error('Error denying payment:', err);
    }
  };

  // 🔹 Set back to pending
  const setPendingPayment = async (id, userEmail, referenceNumber, amount) => {
    try {
      await update(ref(db, `payments/${id}`), { status: 'pending' });
      await sendEmail(userEmail, 'set to pending', referenceNumber, amount);
    } catch (err) {
      console.error('Error setting to pending:', err);
    }
  };

  // Filter payments based on selection
  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <section className="payment-section">
      {/* Header & Filters */}
      <div className="payment-header">
        <div className="header-text">
          <h2>Payment Transactions</h2>
          <p>Monitor and manage incoming user payments.</p>
        </div>
        
        <div className="filter-bar">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <Clock size={14} /> Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            <CheckCircle size={14} /> Approved
          </button>
          <button 
            className={`filter-btn ${filter === 'denied' ? 'active' : ''}`}
            onClick={() => setFilter('denied')}
          >
            <XCircle size={14} /> Denied
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="payment-table">
            <thead>
              <tr>
                <th>User Detail</th>
                <th>Reference No.</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {p.userEmail ? p.userEmail.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="user-meta">
                          <span className="user-email">{p.userEmail || 'Unknown User'}</span>
                          <span className="user-id">ID: {p.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ref-cell">
                        <code>{p.referenceNumber}</code>
                        <ExternalLink size={12} className="external-icon" />
                      </div>
                    </td>
                    <td>
                      <span className="amount-text">₱{p.amount?.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${p.status}`}>
                        <span className="dot"></span>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        {p.status === 'pending' ? (
                          <>
                            <button 
                              className="action-btn approve" 
                              title="Approve"
                              onClick={() => approvePayment(p.id, p.userEmail, p.referenceNumber, p.amount)}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              className="action-btn deny" 
                              title="Deny"
                              onClick={() => denyPayment(p.id, p.userEmail, p.referenceNumber, p.amount)}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="action-btn reset" 
                            title="Reset to Pending"
                            onClick={() => setPendingPayment(p.id, p.userEmail, p.referenceNumber, p.amount)}
                          >
                            <Clock size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No {filter !== 'all' ? filter : ''} payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminPayment;
