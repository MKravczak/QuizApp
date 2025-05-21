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
    return (
      <div className="text-center my-5">
        <div className="spinner-border" style={{ color: 'var(--accent-primary)' }} role="status"></div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="section-title mb-4">Kategorie</h3>
      <div className="row gy-4">
        <div className="col-lg-6 mb-4 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="subject-card math" onClick={() => navigate('/decks')}>
              <h3>Fiszki</h3>
            </div>
            <div className="card-body d-flex flex-column">
              <p className="card-text">Twórz i zarządzaj swoimi zestawami fiszek do nauki. Możesz tworzyć własne talie lub korzystać z publicznych.</p>
              <Link to="/decks" className="btn btn-primary w-100 mt-auto">Przejdź do fiszek</Link>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="subject-card physics" onClick={() => navigate('/quizzes')}>
              <h3>Quizy</h3>
            </div>
            <div className="card-body d-flex flex-column">
              <p className="card-text">Twórz i rozwiązuj quizy oparte na twoich zestawach fiszek. Sprawdź swoją wiedzę w formie testu.</p>
              <Link to="/quizzes" className="btn btn-primary w-100 mt-auto">Przejdź do quizów</Link>
            </div>
          </div>
        </div>
      
        <div className="col-lg-6 mb-4 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="subject-card chemistry" onClick={() => navigate('/quizzes/statistics')}>
              <h3>Statystyki</h3>
            </div>
            <div className="card-body d-flex flex-column">
              <p className="card-text">Zobacz statystyki swoich quizów i postępy w nauce.</p>
              <Link to="/quizzes/statistics" className="btn btn-primary w-100 mt-auto">Zobacz statystyki</Link>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="subject-card reasoning" onClick={() => navigate('/reasoning')}>
              <h3>Rozumowanie</h3>
            </div>
            <div className="card-body d-flex flex-column">
              <p className="card-text">Sprawdź swoje umiejętności logicznego myślenia. Ta funkcjonalność będzie dostępna wkrótce.</p>
              <button className="btn btn-success w-100 mt-auto" disabled>Ćwicz rozumowanie</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 