import { userAPI } from './api';

class AuthService {
  async login(username, password) {
    try {
      const response = await userAPI.login({ username, password });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.id);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  async register(username, email, password, firstName = '', lastName = '') {
    try {
      return await userAPI.register({
        username,
        email,
        password,
        firstName,
        lastName
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    if (user && user.token) {
      // Można dodać walidację tokenu lub sprawdzenie jego ważności
      return true;
    }
    return false;
  }

  getToken() {
    const user = this.getCurrentUser();
    return user?.token || localStorage.getItem('token');
  }

  getAuthHeader() {
    const user = this.getCurrentUser();
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    } else {
      return {};
    }
  }
}

export default new AuthService(); 