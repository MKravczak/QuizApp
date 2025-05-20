import axios from 'axios';
import API_BASE_URL from './api-config';

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('Response Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
    return Promise.reject(error);
  }
);

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

  async register(username, email, password, firstName = '', lastName = '') {
    return axios.post(`${API_BASE_URL.auth}/register`, {
      username,
      email,
      password,
      firstName,
      lastName
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