import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';

const TeacherDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Reference to teacher's exams in Realtime DB
    const examsRef = ref(db, `teachers/${user.uid}/exams`);

    // Listen to changes
    const unsubscribe = onValue(examsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array with IDs
        const examsArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setExams(examsArray);
      } else {
        setExams([]);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user, navigate]);

  return (
    <div className="dashboard-page" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Teacher Dashboard</h1>

      {exams.length === 0 ? (
        <p>No exams created yet.</p>
      ) : (
        exams.map((exam) => (
          <div
            key={exam.id}
            className="exam-card"
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1rem',
              background: '#f9f9f9'
            }}
          >
            <h3>{exam.subject}</h3>
            <p>Access Code: {exam.accessCode}</p>
            <p>
              Created:{' '}
              {exam.createdAt
                ? new Date(exam.createdAt).toLocaleDateString()
                : 'N/A'}
            </p>

            <button
              onClick={() =>
                navigate(`/teacher/dashboard/${exam.id}`)
              }
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: '#3e2723',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View Results
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TeacherDashboard;
