import axios from 'axios';

const API_URL = '/api/auth/';

class AuthService {
  async login(username, password) {
    const response = await axios.post(API_URL + 'login', {
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
    return axios.post(API_URL + 'register', {
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