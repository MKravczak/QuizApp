import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="mt-4">
      <div className="page-header">
        <h1 className="section-title">Panel użytkownika</h1>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">Witaj, {currentUser.username}!</h2>
          <p className="card-text">Zostałeś pomyślnie zalogowany do aplikacji QuizApp.</p>
          <p className="card-text">Wybierz jedną z poniższych kategorii, aby rozpocząć.</p>
        </div>
      </div>
      
      <h3 className="section-title">Kategorie</h3>
      <div className="row">
        <div className="col-md-6 mb-4">
          <Link to="/decks" className="text-decoration-none">
            <div className="subject-card math">
              <h3>Fiszki</h3>
            </div>
          </Link>
          <div className="card">
            <div className="card-body">
              <p className="card-text">Twórz i zarządzaj swoimi zestawami fiszek do nauki. Możesz tworzyć własne talie lub korzystać z publicznych.</p>
              <Link to="/decks" className="btn btn-primary w-100">Przejdź do fiszek</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="subject-card physics">
            <h3>Quizy</h3>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="card-text">Twórz i rozwiązuj quizy. Ta funkcjonalność będzie dostępna wkrótce.</p>
              <button className="btn btn-secondary w-100" disabled>Przejdź do quizów</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="subject-card chemistry">
            <h3>Statystyki</h3>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="card-text">Zobacz swoje postępy w nauce. Ta funkcjonalność będzie dostępna wkrótce.</p>
              <button className="btn btn-danger w-100" disabled>Zobacz statystyki</button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="subject-card reasoning">
            <h3>Rozumowanie</h3>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="card-text">Sprawdź swoje umiejętności logicznego myślenia. Ta funkcjonalność będzie dostępna wkrótce.</p>
              <button className="btn btn-success w-100" disabled>Ćwicz rozumowanie</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 