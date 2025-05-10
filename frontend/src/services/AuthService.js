import axios from 'axios';
import API_BASE_URL from './api-config';

class AuthService {
  async login(username, password) {
    const response = await axios.post(`${API_BASE_URL.auth}/login`, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
  }

  async register(username, email, password) {
    return axios.post(`${API_BASE_URL.auth}/register`, {
      username,
      email,
      password
    });
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
    return user?.token;
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