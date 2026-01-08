import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import './AboutGame.css';
import backgroundImage from './assets/bg.png';

// GLOBAL USER CONTEXT
import { UserContext } from './UserContext';

const AboutGame = () => {
  const { user } = useContext(UserContext);

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
            <Link to="/about" className="active">ABOUT GAME</Link>
            <Link to="/teacher">TEACHER</Link>
          </div>

          {/* LOGIN STATUS */}
          <div className="nav-login">
            <div className="login-pill">
              <div className="login-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="avatar-img" />
                ) : (
                  '🎮'
                )}
              </div>
              <span className="login-text">
                {user ? 'PLAYER' : 'GUEST'}
              </span>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="glass-card about-card">
            <h1 className="game-title" style={{ fontSize: '2.2rem' }}>
              ABOUT THE GAME
            </h1>

            {/* INTRO */}
            <p className="about-text">
              <strong>Johnpaul College: Campus Case</strong> is an educational
              adventure game where players learn through exploration,
              dialogue, and problem-solving challenges set inside the campus.
            </p>

            {/* SOLO MODE */}
            <h2 className="about-heading">🎮 Solo Mode</h2>
            <p className="about-text">
              Solo Mode follows a day-by-day progression system.
              The game begins with a dialogue showing the current day
              (e.g., Day 1 – Monday). After the dialogue, the player opens
              the campus map and selects the correct classroom.
            </p>

            <p className="about-text">
              Inside the classroom, the teacher introduces the subject through
              dialogue. The player then answers <strong>10 questions</strong>
              related to that subject. After completing the questions,
              the game advances to the next day.
            </p>

            <p className="about-text">
              This cycle continues until <strong>Day 6</strong>.
              On <strong>Day 7</strong>, the game displays the final results,
              showing the player’s scores for all subjects.
            </p>

            {/* ONLINE MODE */}
            <h2 className="about-heading">🌐 Online Mode</h2>
            <p className="about-text">
              Online Mode allows students to answer questions prepared by a
              teacher. To enter this mode, the player must input an
              <strong> access code </strong> provided by the teacher.
            </p>

            <p className="about-text">
              Once the code is entered, the assigned questions are loaded.
              After answering all questions, the game immediately displays
              the player’s results and score.
            </p>

            {/* ESCAPE ROOM MODE */}
            <h2 className="about-heading">🧩 Escape Room Mode</h2>
            <p className="about-text">
              Escape Room Mode starts on a map containing multiple rooms.
              Only <strong>Room 1</strong> is unlocked at the beginning.
              Other rooms remain locked until the previous level is completed.
            </p>

            <p className="about-text">
              Inside a room, players interact with objects such as desks,
              boards, and other items. Each object contains a question.
              Correctly answering these questions unlocks the room door.
            </p>

            <p className="about-text">
              After escaping a room, the game returns to the map and unlocks
              the next room, allowing the player to progress through levels
              one by one.
            </p>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="game-footer">
          <p>© 2026 Johnpaul College. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AboutGame;
