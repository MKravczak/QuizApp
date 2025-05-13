import axios from 'axios';
import API_BASE_URL from './api-config';
import authHeader from './AuthHeader';

class UserService {
    getUsernamesByIds(userIds) {
        return axios.post(`${API_BASE_URL.users}/usernames`, userIds, {
            headers: authHeader()
        });
    }
}

export default new UserService(); 