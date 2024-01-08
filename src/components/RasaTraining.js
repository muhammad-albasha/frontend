import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stories } from './Stories';
import { UserManager } from './UserManager';

const RasaTraining = () => {
  const { logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="rasa-training-container">
      <div className="rasa-training-header">
        <h1>Chatbot Training Data</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="rasa-training-content">
        <div className="story-section">
          <Stories />
        </div>
        {userRole === 'admin' && (
          <div className="user-section">
            <UserManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default RasaTraining;
