import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import '../styles/Dashboard.css';

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
    return (
      <div className="text-center my-5">
        <div className="spinner-border" style={{ color: 'var(--accent-primary)' }} role="status"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Witaj, <span className="username-highlight">{currentUser.username}</span>
        </h1>
        <p className="dashboard-subtitle">Wybierz kategorię, aby rozpocząć naukę</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card flashcards-card">
          <div className="card-icon">
            <i className="bi bi-layers-fill"></i>
          </div>
          <div className="card-content">
            <h3>Fiszki</h3>
            <p>Twórz i zarządzaj swoimi zestawami fiszek do nauki. Możesz tworzyć własne talie lub korzystać z publicznych.</p>
            <Link to="/decks" className="dashboard-btn primary">
              <span>Przejdź do fiszek</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
        
        <div className="dashboard-card quizzes-card">
          <div className="card-icon">
            <i className="bi bi-patch-question-fill"></i>
          </div>
          <div className="card-content">
            <h3>Quizy</h3>
            <p>Twórz i rozwiązuj quizy oparte na twoich zestawach fiszek. Sprawdź swoją wiedzę w formie testu.</p>
            <Link to="/quizzes" className="dashboard-btn primary">
              <span>Przejdź do quizów</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      
        <div className="dashboard-card statistics-card">
          <div className="card-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <div className="card-content">
            <h3>Statystyki</h3>
            <p>Zobacz statystyki swoich quizów i postępy w nauce. Analizuj swoje wyniki i śledź rozwój.</p>
            <Link to="/quizzes/statistics" className="dashboard-btn primary">
              <span>Zobacz statystyki</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
        
        <div className="dashboard-card groups-card">
          <div className="card-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="card-content">
            <h3>Grupy</h3>
            <p>Zarządzaj grupami użytkowników, twórz zespoły i udostępniaj quizy oraz fiszki członkom grup.</p>
            <Link to="/groups" className="dashboard-btn primary">
              <span>Przejdź do grup</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 