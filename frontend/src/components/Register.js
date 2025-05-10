import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    setSuccessful(false);

    try {
      const response = await AuthService.register(username, email, password);
      setMessage(response.data.message || 'Rejestracja zakończona sukcesem!');
      setSuccessful(true);
      setLoading(false);
    } catch (error) {
      const errorMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setMessage('Błąd rejestracji: ' + errorMessage);
      setSuccessful(false);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Rejestracja</h2>

      {!successful && (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">Nazwa użytkownika</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Rejestracja...' : 'Zarejestruj się'}
            </button>
          </div>
        </form>
      )}

      {message && (
        <div className={successful ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      {successful && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login">
            <button>Przejdź do logowania</button>
          </Link>
        </div>
      )}

      {!successful && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </div>
      )}
    </div>
  );
}

export default Register; 