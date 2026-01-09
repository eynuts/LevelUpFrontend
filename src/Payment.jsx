// Payment.jsx
import React, { useState, useContext, useEffect } from 'react';
import './Payment.css';

// Firebase Realtime Database
import { db } from './firebase';
import { ref, set, push, onValue, query, orderByChild, equalTo } from 'firebase/database';

// User Context
import { UserContext } from './UserContext';

const Payment = ({ onClose }) => {
  const { user } = useContext(UserContext);

  const [refInput, setRefInput] = useState('');
  const [status, setStatus] = useState(null); // null | pending | approved
  const [loading, setLoading] = useState(false);

  // 🔍 CHECK IF USER ALREADY HAS PENDING OR APPROVED PAYMENT
  useEffect(() => {
    if (!user) return;

    const paymentsRef = query(
      ref(db, 'payments'),
      orderByChild('userId'),
      equalTo(user.uid)
    );

    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const payments = snapshot.val();

      let foundPending = false;
      let foundApproved = false;

      for (const key in payments) {
        if (payments[key].status === 'pending') {
          foundPending = true;
          break; // stop at first pending
        }
        if (payments[key].status === 'approved') {
          foundApproved = true;
        }
      }

      if (foundApproved) {
        // ✅ Payment approved: auto-download and close modal
        window.location.href =
          'https://github.com/eynuts/LevelUp/releases/download/1.0.0/CampusChronicles.rar';
        onClose();
      } else if (foundPending) {
        setStatus('pending');
      }
    });

    return () => unsubscribe();
  }, [user, onClose]);

  // 📤 SEND PAYMENT
  const handleSendPayment = async () => {
    if (!refInput.trim()) {
      alert('Please enter the reference number.');
      return;
    }

    try {
      setLoading(true);

      const paymentRef = push(ref(db, 'payments'));

      await set(paymentRef, {
        referenceNumber: refInput.trim(),
        amount: 100,
        status: 'pending',
        userId: user.uid,
        userEmail: user.email,
        createdAt: Date.now()
      });

      setStatus('pending');
    } catch (err) {
      console.error('Payment upload failed:', err);
      alert('Failed to send payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <h2>Payment Required</h2>
        <p>
          Price: <strong>₱100</strong>
        </p>

        {/* QR CODE */}
        <div className="qr-code">
          <img
            src="https://via.placeholder.com/200?text=QR+Code"
            alt="QR Code"
          />
        </div>

        {/* INPUT + SEND */}
        {status !== 'pending' && (
          <>
            <input
              type="text"
              className="ref-input"
              placeholder="Enter reference number"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
            />

            <button
              className="send-button"
              onClick={handleSendPayment}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Payment'}
            </button>
          </>
        )}

        {/* PENDING MESSAGE */}
        {status === 'pending' && (
          <p className="status-pending">
            ⏳ Payment is pending. Please wait for admin approval.
          </p>
        )}

        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Payment;

