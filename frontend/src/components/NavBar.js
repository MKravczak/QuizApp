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
              <h2 className="mb-0" style={{ color: 'var(--primary-purple)' }}>QuizApp</h2>
            </Link>
            {currentUser && (
              <div className="ms-4">
                <Link to="/dashboard" className="btn btn-sm me-2" style={{ color: 'var(--dark-gray)' }}>
                  Dashboard
                </Link>
                <Link to="/decks" className="btn btn-sm" style={{ color: 'var(--dark-gray)' }}>
                  Fiszki
                </Link>
              </div>
            )}
          </div>
          
          {currentUser ? (
            <div className="d-flex align-items-center">
              <span className="me-3" style={{ color: 'var(--dark-gray)' }}>
                Witaj, <strong>{currentUser.username}</strong>
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-sm btn-danger"
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="btn btn-sm btn-primary me-2">
                Logowanie
              </Link>
              <Link to="/register" className="btn btn-sm btn-outline-primary">
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