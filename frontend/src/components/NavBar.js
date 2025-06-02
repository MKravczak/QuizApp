import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const NavBar = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="app-navbar">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Link to="/dashboard" className="text-decoration-none">
              <h2 className="mb-0" style={{ 
                background: 'linear-gradient(135deg, #0a95a8, #0ac799)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>QuizApp</h2>
            </Link>
            {currentUser && (
              <div className="ms-4">
                <Link to="/groups" className="btn btn-sm me-2" style={{ fontWeight: '600' }}>
                  Grupy
                </Link>
                <Link to="/decks" className="btn btn-sm me-2" style={{ fontWeight: '600' }}>
                  Fiszki
                </Link>
                <Link to="/quizzes" className="btn btn-sm" style={{ fontWeight: '600' }}>
                  Quizy
                </Link>
              </div>
            )}
          </div>
          
          {currentUser ? (
            <div className="d-flex align-items-center">
              <span className="me-3 text-light">
                Witaj, <strong>{currentUser.username}</strong>
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #e03f3f, #d12340)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '600',
                  textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)'
                }}
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="btn btn-sm btn-primary me-2" style={{ fontWeight: '600', textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)' }}>
                Logowanie
              </Link>
              <Link to="/register" className="btn btn-sm btn-outline-primary" style={{ fontWeight: '600' }}>
                Rejestracja
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar; 