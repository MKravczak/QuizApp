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
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="card">
          <div className="card-header text-center" style={{ backgroundColor: 'var(--light-purple)', color: 'white' }}>
            <h2 className="mb-0">Rejestracja</h2>
          </div>
          <div className="card-body p-4">
            {message && (
              <div 
                className={`alert ${successful ? 'alert-success' : 'alert-danger'}`} 
                role="alert"
              >
                {message}
              </div>
            )}

            {!successful ? (
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Nazwa użytkownika</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Hasło</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Rejestracja...
                      </>
                    ) : 'Zarejestruj się'}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    Masz już konto? <Link to="/login" className="text-decoration-none" style={{ color: 'var(--primary-purple)' }}>Zaloguj się</Link>
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  <p className="mt-3 fs-5">Rejestracja zakończona pomyślnie!</p>
                </div>
                <Link to="/login" className="btn btn-primary">
                  Przejdź do logowania
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 