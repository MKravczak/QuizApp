import { userAPI } from './api';

class UserService {
    getUsernamesByIds(userIds) {
        return userAPI.getUsernamesByIds(userIds);
    }
}

export default new UserService(); 