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
            <Link to="/dashboard" className="text-decoration-none navbar-brand">
              <h2 className="mb-0 brand-title">
                <i className="bi bi-mortarboard-fill me-2"></i>
                QuizApp
              </h2>
            </Link>
            {currentUser && (
              <div className="navbar-nav ms-4">
                <Link to="/groups" className="nav-link">
                  <i className="bi bi-people-fill me-1"></i>
                  Grupy
                </Link>
                <Link to="/decks" className="nav-link">
                  <i className="bi bi-layers-fill me-1"></i>
                  Fiszki
                </Link>
                <Link to="/quizzes" className="nav-link">
                  <i className="bi bi-patch-question-fill me-1"></i>
                  Quizy
                </Link>
              </div>
            )}
          </div>
          
          {currentUser ? (
            <div className="d-flex align-items-center">
              <span className="user-greeting me-3">
                <i className="bi bi-person-circle me-1"></i>
                 <strong>{currentUser.username}</strong>
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-danger btn-sm logout-btn"
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Wyloguj
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary btn-sm me-2">
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Logowanie
              </Link>
              <Link to="/register" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-person-plus me-1"></i>
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