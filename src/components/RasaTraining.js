// src/components/RasaTraining.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stories } from './Stories';

const RasaTraining = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
// const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="rasa-training-container">
      <div className="rasa-training-header">
        <h1>Rasa Training data</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      <div className="rasa-training-content">
        <div className="story-section">
          <h2>Stories</h2>
          <Stories />
        </div>
      </div>
    </div>
  );
};

export default RasaTraining;