import axios from 'axios';
import authHeader from './AuthHeader';
import API_BASE_URL from './api-config';

const API_URL = API_BASE_URL.groups;

class GroupService {
    // Pobieranie wszystkich grup
    getAllGroups() {
        return axios.get(`${API_URL}`, { headers: authHeader() });
    }

    // Pobieranie grupy po ID
    getGroupById(id) {
        return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
    }

    // Pobieranie grupy po nazwie
    getGroupByName(name) {
        return axios.get(`${API_URL}/name/${name}`, { headers: authHeader() });
    }

    // Tworzenie nowej grupy (tylko admin)
    createGroup(groupData) {
        return axios.post(`${API_URL}`, groupData, { headers: authHeader() });
    }

    // Aktualizacja grupy (tylko admin)
    updateGroup(id, groupData) {
        return axios.put(`${API_URL}/${id}`, groupData, { headers: authHeader() });
    }

    // Usuwanie grupy (tylko admin)
    deleteGroup(id) {
        return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
    }

    // Dodawanie użytkownika do grupy po ID (obecnie dostępne w backend)
    addUserToGroupById(groupId, userId) {
        return axios.post(`${API_URL}/${groupId}/members/${userId}`, {}, { headers: authHeader() });
    }

    // Usuwanie użytkownika z grupy po ID (obecnie dostępne w backend)
    removeUserFromGroupById(groupId, userId) {
        return axios.delete(`${API_URL}/${groupId}/members/${userId}`, { headers: authHeader() });
    }

    // Pobieranie grup użytkownika
    getMyGroups() {
        return axios.get(`${API_URL}/my-groups`, { headers: authHeader() });
    }

    // Pobieranie członków grupy
    getGroupMembers(id) {
        return axios.get(`${API_URL}/${id}/members`, { headers: authHeader() });
    }

    // Pobieranie wszystkich użytkowników (tylko admin)
    getAllUsers() {
        const usersAPI = API_BASE_URL.users;
        return axios.get(`${usersAPI}`, { headers: authHeader() });
    }

    // Wyszukiwanie użytkowników po nazwie (tylko admin)
    searchUsers(query) {
        const usersAPI = API_BASE_URL.users;
        return axios.get(`${usersAPI}/search?query=${encodeURIComponent(query)}`, { headers: authHeader() });
    }

    // Helper do dodawania użytkownika po nazwie - używa getUserByUsername i potem dodaje po ID
    async addUserToGroupByName(groupName, username) {
        try {
            // Najpierw znajdź grupę po nazwie
            const groupResponse = await this.getGroupByName(groupName);
            const group = groupResponse.data;

            // Znajdź użytkownika po nazwie przez wyszukiwanie
            const usersResponse = await this.searchUsers(username);
            const users = usersResponse.data;
            
            // Znajdź dokładne dopasowanie nazwy użytkownika
            const user = users.find(u => u.username === username);
            
            if (!user) {
                throw new Error(`Użytkownik o nazwie "${username}" nie został znaleziony`);
            }

            // Dodaj użytkownika do grupy po ID
            return await this.addUserToGroupById(group.id, user.id);
        } catch (error) {
            throw error;
        }
    }

    // Helper do usuwania użytkownika po nazwie
    async removeUserFromGroupByName(groupName, username) {
        try {
            // Najpierw znajdź grupę po nazwie
            const groupResponse = await this.getGroupByName(groupName);
            const group = groupResponse.data;

            // Znajdź użytkownika po nazwie przez wyszukiwanie
            const usersResponse = await this.searchUsers(username);
            const users = usersResponse.data;
            
            // Znajdź dokładne dopasowanie nazwy użytkownika
            const user = users.find(u => u.username === username);
            
            if (!user) {
                throw new Error(`Użytkownik o nazwie "${username}" nie został znaleziony`);
            }

            // Usuń użytkownika z grupy po ID
            return await this.removeUserFromGroupById(group.id, user.id);
        } catch (error) {
            throw error;
        }
    }
}

export default new GroupService(); 