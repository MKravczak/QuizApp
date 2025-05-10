import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Panel użytkownika</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            width: 'auto', 
            padding: '8px 16px',
            backgroundColor: '#f44336' 
          }}
        >
          Wyloguj się
        </button>
      </div>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>Witaj, {currentUser.username}!</h2>
        <p>Zostałeś pomyślnie zalogowany do aplikacji QuizApp.</p>
        <p>Aby kontynuować pracę, wybierz jedną z poniższych opcji:</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            style={{ 
              backgroundColor: '#4CAF50',
              width: 'auto',
              padding: '10px 20px' 
            }}
          >
            Stwórz quiz
          </button>
          <button 
            style={{ 
              backgroundColor: '#2196F3',
              width: 'auto',
              padding: '10px 20px' 
            }}
          >
            Przeglądaj quizy
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 