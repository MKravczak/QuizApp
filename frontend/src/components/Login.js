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
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="card">
          <div className="card-header text-center" style={{ backgroundColor: 'var(--primary-purple)', color: 'white' }}>
            <h2 className="mb-0">Logowanie</h2>
          </div>
          <div className="card-body p-4">
            {message && (
              <div className="alert alert-danger" role="alert">
                {message}
              </div>
            )}

            <form onSubmit={handleLogin}>
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
                      Logowanie...
                    </>
                  ) : 'Zaloguj się'}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="mb-0">
                Nie masz konta? <Link to="/register" className="text-decoration-none" style={{ color: 'var(--primary-purple)' }}>Zarejestruj się</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 