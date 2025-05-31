import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [successful, setSuccessful] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});
    setLoading(true);
    setSuccessful(false);

    try {
      console.log("Sending registration data:", { username, email, password, firstName, lastName });
      const response = await AuthService.register(username, email, password, firstName, lastName);
      setMessage(response.data.message || 'Rejestracja zakończona sukcesem!');
      setSuccessful(true);
      setLoading(false);
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response && error.response.data) {
        // Handle structured validation errors
        if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          setErrors(error.response.data);
          setMessage('Proszę poprawić błędy w formularzu.');
        } else {
          // Handle message-based errors
          const errorMessage = error.response.data.message || error.message || error.toString();
          setMessage('Błąd rejestracji: ' + errorMessage);
        }
      } else {
        setMessage('Błąd rejestracji: ' + (error.message || 'Nieznany błąd'));
      }
      
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
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">Imię</label>
                  <input
                    type="text"
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label">Nazwisko</label>
                  <input
                    type="text"
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Hasło</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
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