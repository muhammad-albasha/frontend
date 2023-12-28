import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stories } from './Stories';
import AdminAddUser, { UserManager } from './UserManager';

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
        <h1>Chatbot Training data</h1>
        <button type='reset' onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="rasa-training-content">
        <div className="story-section">
          <Stories />
        </div>
        <div className="user-section">
          {userRole === 'admin' && <UserManager />}
        </div>
      </div>
    </div>
  );
};

export default RasaTraining;
