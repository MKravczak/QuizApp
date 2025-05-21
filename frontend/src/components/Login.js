import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await AuthService.login(username, password);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setMessage('Błąd logowania: ' + errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="text-center mb-4">
        <h2 className="mb-3" style={{ 
          background: 'linear-gradient(135deg, #0a95a8, #0ac799)', 
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          fontWeight: '700'
        }}>QuizApp</h2>
        <h3 className="text-white mb-4">Logowanie</h3>
      </div>
      
      {message && (
        <div className="alert" role="alert" style={{ 
          backgroundColor: 'rgba(224, 63, 63, 0.2)',
          borderColor: 'rgba(224, 63, 63, 0.3)',
          color: '#e03f3f',
          borderRadius: '8px',
          padding: '12px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username" className="form-label text-white mb-2">Nazwa użytkownika</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label text-white mb-2">Hasło</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          />
        </div>

        <div className="d-grid mt-4">
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #0a95a8, #0ac799)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logowanie...
              </>
            ) : 'Zaloguj się'}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="mb-0 text-white-50">
          Nie masz konta? <Link to="/register" className="text-decoration-none" style={{ color: '#0ac799' }}>Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 