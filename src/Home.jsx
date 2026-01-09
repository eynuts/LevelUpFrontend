import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import backgroundImage from './assets/bg.png';

// Import game mode images
import soloImg from './assets/solo.png';
import soloHover from './assets/solohover.png';
import escapeImg from './assets/scape.png';
import escapeHover from './assets/scapehover.png';
import onlineImg from './assets/online.png';
import onlineHover from './assets/onlinehover.png';

// ✅ IMPORT PAYMENT MODAL
import Payment from './Payment';

// Firebase
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';

// GLOBAL USER CONTEXT
import { UserContext } from './UserContext';

const Home = () => {
  const { user } = useContext(UserContext);

  // ✅ Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending | approved

  // ✅ Admin state
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔐 LOGIN
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // 🔓 LOGOUT
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 👤 SAVE / LOAD USER DATA
  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);

    const initUser = async () => {
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // ✅ NEW USER
        await set(userRef, {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          role: 'user', // default role
          createdAt: Date.now()
        });
        setIsAdmin(false);
      } else {
        // ✅ EXISTING USER
        const data = snapshot.val();
        setIsAdmin(data.role === 'admin');
      }
    };

    initUser();
  }, [user]);

  // 💳 DOWNLOAD CLICK
  const handleDownloadClick = () => {
    if (!user) {
      alert('Please login first.');
      return;
    }
    const refCode = 'REF-' + Math.floor(100000 + Math.random() * 900000);
    setReferenceNumber(refCode);
    setPaymentStatus('pending');
    setShowPayment(true);
  };

  // ✅ Simulate payment status check
  useEffect(() => {
    if (!showPayment) return;

    const interval = setInterval(() => {
      console.log('Checking payment status for:', referenceNumber);
      // Replace with backend check later
      setPaymentStatus('pending');
    }, 5000);

    return () => clearInterval(interval);
  }, [showPayment, referenceNumber]);

  return (
    <div className="home-page">
      {/* Background */}
      <div
        className="bg-overlay"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="content-wrapper">
        {/* NAVBAR */}
        <nav className="game-nav">
          <div className="nav-spacer"></div>

          <div className="nav-links">
            <Link to="/" className="active">HOME</Link>
            <Link to="/about">ABOUT GAME</Link>
            <Link to="/teacher">TEACHER</Link>
          </div>

          {/* LOGIN / LOGOUT / ADMIN */}
<div
  className="nav-login"
  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
>
  {/* ADMIN DASHBOARD */}
  {isAdmin && (
    <Link to="/admin" className="login-pill">
      <div className="login-avatar">🛠️</div>
      <span className="login-text">Admin</span>
    </Link>
  )}

  {/* LOGIN / LOGOUT */}
  <div
    className="login-pill"
    onClick={user ? handleLogout : handleLogin}
    style={{ cursor: 'pointer' }}
  >
    <div className="login-avatar">
      {user ? (
        <img src={user.photoURL} alt="Avatar" className="avatar-img" />
      ) : '👧'}
    </div>
    <span className="login-text">
      {user ? 'Logout' : 'Login'}
    </span>
  </div>
</div>

        </nav>

        {/* MAIN */}
        <main className="main-content">
          <div className="glass-card">
            <h1 className="game-title">
              CAMPUS CHRONICLES:<br />ACADEMIC ADVENTURE
            </h1>

            <div className="cta-section">
              <button
                className="download-button"
                onClick={handleDownloadClick}
              >
                DOWNLOAD GAME NOW
              </button>
              <p className="sub-text">
                Available for Windows, macOS, and Linux
              </p>
            </div>

            {/* GAME MODES */}
            <div className="modes-grid">
              <GameModeCard img={soloImg} hoverImg={soloHover} />
              <GameModeCard img={escapeImg} hoverImg={escapeHover} />
              <GameModeCard img={onlineImg} hoverImg={onlineHover} />
            </div>
          </div>
        </main>

        <footer className="game-footer">
          <p>© 2026 Johnpaul College. All Rights Reserved.</p>
        </footer>
      </div>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <Payment
          referenceNumber={referenceNumber}
          paymentStatus={paymentStatus}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

// MODE CARD
const GameModeCard = ({ img, hoverImg }) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className="wood-card"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div
        className="emoji-box"
        style={{
          backgroundImage: `url(${isHover ? hoverImg : img})`
        }}
      />
    </div>
  );
};

export default Home;

