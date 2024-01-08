import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stories } from './Stories';
import { UserManager } from './UserManager';

const RasaTraining = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
        {user && user.role === 'admin' && (
          <div className="user-section">
            <UserManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default RasaTraining;
