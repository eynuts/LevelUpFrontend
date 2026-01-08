import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import './Teacher.css';
import backgroundImage from './assets/bg.png';

// Firebase
import { auth, db } from './firebase';
import { ref, set, get, child } from 'firebase/database';
import { signOut } from 'firebase/auth';

// GLOBAL USER CONTEXT
import { UserContext } from './UserContext';

const Teacher = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const [subject, setSubject] = useState(''); // now it's a text input
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, () => ({
      questionText: '',
      options: ['', '', '', ''],
      correctIndex: null
    }))
  );
  const [generatedCode, setGeneratedCode] = useState('');

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswer = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctIndex = oIndex;
    setQuestions(newQuestions);
  };

  // ✅ Generate a unique 6-digit code
  const generateUniqueCode = async () => {
    const dbRef = ref(db);
    let code = '';
    let exists = true;

    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const snapshot = await get(child(dbRef, `accessCodes/${code}`));
      exists = snapshot.exists();
    }

    return code;
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      alert('Please type the subject name.');
      return;
    }

    if (!questions[0].questionText.trim()) {
      alert('Please fill in at least the first question.');
      return;
    }

    try {
      const code = await generateUniqueCode();
      setGeneratedCode(code);

      // Save exam under teacher UID
      await set(ref(db, `teachers/${user.uid}/exams/${code}`), {
        teacherEmail: user.email,
        subject,
        questions,
        accessCode: code,
        createdAt: Date.now()
      });

      // Store code for uniqueness check
      await set(ref(db, `accessCodes/${code}`), true);

      alert(`Questions saved! Your Access Code is: ${code}`);
    } catch (err) {
      console.error('Error saving exam:', err);
      alert('Failed to save exam. Try again.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="home-page">
      <div
        className="bg-overlay"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="content-wrapper">
        {/* NAVBAR */}
        <nav className="game-nav">
          <div className="nav-spacer"></div>

          <div className="nav-links">
            <Link to="/">HOME</Link>
            <Link to="/about">ABOUT GAME</Link>
            <Link to="/teacher" className="active">TEACHER</Link>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="nav-login" style={{ display: 'flex', gap: '0.5rem' }}>
            {/* DASHBOARD BUTTON */}
            <Link to="/teacher/dashboard" className="login-pill">
              <div className="login-avatar">📊</div>
              <span className="login-text">Dashboard</span>
            </Link>

            {/* LOGOUT */}
            <div
              className="login-pill"
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              <div className="login-avatar">
                <img src={user.photoURL} alt="Avatar" className="avatar-img" />
              </div>
              <span className="login-text">Logout</span>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <div className="glass-card teacher-card">
            <div className="badge-teacher">QUESTION MANAGEMENT</div>

            <h1 className="game-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              EXAM CREATOR
            </h1>

            {/* SUBJECT INPUT */}
            <div className="subject-container">
              <label className="sub-text">SUBJECT NAME</label>
              <input
                type="text"
                className="game-select"
                placeholder="Type subject here..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* QUESTIONS */}
            <div className="questions-scroll-area">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="question-entry">
                  <div className="q-header">
                    <span className="q-number">#{qIndex + 1}</span>
                    <input
                      type="text"
                      className="q-input-main"
                      placeholder="Enter your question here..."
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    />
                  </div>

                  <div className="options-layout">
                    {q.options.map((opt, oIndex) => (
                      <div
                        key={oIndex}
                        className={`option-field ${
                          q.correctIndex === oIndex ? 'correct-selected' : ''
                        }`}
                      >
                        <input
                          type="text"
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        />
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctIndex === oIndex}
                          onChange={() => handleCorrectAnswer(qIndex, oIndex)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="teacher-footer-actions">
              <button className="download-button" onClick={handleSubmit}>
                SAVE & GENERATE CODE
              </button>

              {generatedCode && (
                <div className="access-code-box">
                  <p>STUDENT ACCESS CODE</p>
                  <div className="code-value">{generatedCode}</div>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="game-footer">
          <p>© 2026 Johnpaul College. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Teacher;
