import React, { useState, useEffect } from 'react';
import GroupService from '../../services/GroupService';
import AuthService from '../../services/AuthService';
import './GroupManagement.css';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Modal states
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [modalGroup, setModalGroup] = useState(null);
    
    // Stany dla tworzenia/edycji grupy
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    
    // Stany dla dodawania członków
    const [showAddMemberForm, setShowAddMemberForm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [usernameSuggestions, setUsernameSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [groupMembers, setGroupMembers] = useState({});
    const [loadingMembers, setLoadingMembers] = useState({});

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setIsAdmin(currentUser.roles.includes('ROLE_ADMIN'));
        }
        loadGroups();
        if (currentUser && currentUser.roles.includes('ROLE_ADMIN')) {
            loadAllUsers();
        }
    }, []);

    // Load members for all groups after loading groups
    useEffect(() => {
        if (groups.length > 0 || myGroups.length > 0) {
            loadAllGroupsMembers();
        }
    }, [groups, myGroups]);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const [allGroupsResponse, myGroupsResponse] = await Promise.all([
                GroupService.getAllGroups(),
                GroupService.getMyGroups()
            ]);
            
            setGroups(allGroupsResponse.data);
            setMyGroups(myGroupsResponse.data);
            
        } catch (err) {
            setError('Błąd podczas ładowania grup: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAllUsers = async () => {
        try {
            setLoadingUsers(true);
            const usersResponse = await GroupService.getAllUsers();
            console.log('Users response:', usersResponse);
            console.log('Users data:', usersResponse.data);
            
            // Upewnij się, że otrzymujemy tablicę
            const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            setAllUsers(users);
        } catch (err) {
            console.error('Błąd podczas ładowania użytkowników:', err);
            setError('Błąd podczas ładowania użytkowników: ' + err.message);
            setAllUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadGroupMembers = async (groupId) => {
        if (groupMembers[groupId] || loadingMembers[groupId]) {
            return;
        }

        try {
            setLoadingMembers(prev => ({...prev, [groupId]: true}));
            const membersResponse = await GroupService.getGroupMembers(groupId);
            setGroupMembers(prev => ({...prev, [groupId]: membersResponse.data}));
        } catch (err) {
            console.error(`Błąd podczas ładowania członków grupy ${groupId}:`, err);
            setGroupMembers(prev => ({...prev, [groupId]: []}));
        } finally {
            setLoadingMembers(prev => ({...prev, [groupId]: false}));
        }
    };

    const loadAllGroupsMembers = async () => {
        const allGroups = [...groups, ...myGroups];
        const uniqueGroups = allGroups.filter((group, index, self) => 
            index === self.findIndex(g => g.id === group.id)
        );

        // Load members for each group
        for (const group of uniqueGroups) {
            await loadGroupMembers(group.id);
        }
    };

    // Search for users by username for autocomplete
    const searchUsers = async (query) => {
        if (!query || query.length < 2) {
            setUsernameSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const response = await GroupService.searchUsers(query);
            setUsernameSuggestions(response.data);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Błąd podczas wyszukiwania użytkowników:', err);
            setUsernameSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleUsernameInputChange = (e) => {
        const value = e.target.value;
        setNewMemberUsername(value);
        searchUsers(value);
    };

    const selectUsername = (username) => {
        setNewMemberUsername(username);
        setShowSuggestions(false);
        setUsernameSuggestions([]);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await GroupService.createGroup(formData);
            setSuccess('Grupa została utworzona pomyślnie!');
            setShowCreateForm(false);
            setFormData({ name: '', description: '' });
            loadGroups();
        } catch (err) {
            setError('Błąd podczas tworzenia grupy: ' + err.message);
        }
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        try {
            await GroupService.updateGroup(editingGroup.id, formData);
            setSuccess('Grupa została zaktualizowana pomyślnie!');
            setEditingGroup(null);
            setFormData({ name: '', description: '' });
            loadGroups();
        } catch (err) {
            setError('Błąd podczas aktualizacji grupy: ' + err.message);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę grupę?')) {
            try {
                await GroupService.deleteGroup(groupId);
                setSuccess('Grupa została usunięta pomyślnie!');
                loadGroups();
            } catch (err) {
                setError('Błąd podczas usuwania grupy: ' + err.message);
            }
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberUsername.trim()) {
            setError('Proszę wprowadzić nazwę użytkownika');
            return;
        }

        try {
            await GroupService.addUserToGroupByName(selectedGroup.name, newMemberUsername);
            setSuccess(`Użytkownik ${newMemberUsername} został dodany do grupy ${selectedGroup.name}!`);
            setShowAddMemberForm(false);
            setNewMemberUsername('');
            setShowSuggestions(false);
            setUsernameSuggestions([]);
            
            // Przeładuj członków dla tej grupy
            setGroupMembers(prev => ({...prev, [selectedGroup.id]: undefined}));
            await loadGroupMembers(selectedGroup.id);
            
            setSelectedGroup(null);
            loadGroups();
        } catch (err) {
            setError('Błąd podczas dodawania użytkownika: ' + err.message);
        }
    };

    const handleRemoveMember = async (groupName, username) => {
        if (window.confirm(`Czy na pewno chcesz usunąć użytkownika ${username} z grupy ${groupName}?`)) {
            try {
                await GroupService.removeUserFromGroupByName(groupName, username);
                setSuccess(`Użytkownik ${username} został usunięty z grupy ${groupName}!`);
                
                // Znajdź grupę po nazwie i przeładuj jej członków
                const group = [...groups, ...myGroups].find(g => g.name === groupName);
                if (group) {
                    setGroupMembers(prev => ({...prev, [group.id]: undefined}));
                    await loadGroupMembers(group.id);
                }
                
                loadGroups();
            } catch (err) {
                setError('Błąd podczas usuwania użytkownika: ' + err.message);
            }
        }
    };

    const startEdit = (group) => {
        setEditingGroup(group);
        setFormData({
            name: group.name,
            description: group.description
        });
        setShowCreateForm(false);
    };

    const cancelEdit = () => {
        setEditingGroup(null);
        setFormData({ name: '', description: '' });
    };

    const openAddMemberForm = (group) => {
        setSelectedGroup(group);
        setShowAddMemberForm(true);
        setShowCreateForm(false);
        setEditingGroup(null);
    };

    const closeAddMemberForm = () => {
        setShowAddMemberForm(false);
        setSelectedGroup(null);
        setNewMemberUsername('');
        setShowSuggestions(false);
        setUsernameSuggestions([]);
    };

    const openMembersModal = (group) => {
        setModalGroup(group);
        setShowMembersModal(true);
    };

    const closeMembersModal = () => {
        setShowMembersModal(false);
        setModalGroup(null);
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Get limited members for card display (first 3)
    const getLimitedMembers = (groupId, limit = 3) => {
        const members = groupMembers[groupId] || [];
        return members.slice(0, limit);
    };

    // Get total member count
    const getMemberCount = (groupId) => {
        return (groupMembers[groupId] || []).length;
    };

    if (loading) {
        return <div className="loading">Ładowanie grup...</div>;
    }

    return (
        <div className="group-management">
            {/* Main Content */}
            <div className="main-content">
                <div className="group-management-header">
                    <h1>Zarządzanie grupami</h1>
                    <div className="header-actions">
                        {isAdmin && (
                            <button 
                                className="btn btn-primary btn-with-icon"
                                onClick={() => {
                                    setShowCreateForm(true);
                                    setEditingGroup(null);
                                    setShowAddMemberForm(false);
                                    clearMessages();
                                }}
                            >
                                <i className="bi bi-plus-circle"></i>
                                Utwórz nową grupę
                            </button>
                        )}
                        {isAdmin && (
                            <button 
                                className="btn btn-secondary btn-sidebar-toggle"
                                onClick={toggleSidebar}
                            >
                                <i className="bi bi-people"></i>
                                Użytkownicy
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                        <button onClick={clearMessages}>×</button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span>{success}</span>
                        <button onClick={clearMessages}>×</button>
                    </div>
                )}

                {/* Formularz tworzenia/edycji grupy */}
                {(showCreateForm || editingGroup) && isAdmin && (
                    <div className="group-form-container">
                        <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup} className="group-form">
                            <h3>{editingGroup ? 'Edytuj grupę' : 'Utwórz nową grupę'}</h3>
                            
                            <div className="form-group">
                                <label htmlFor="name">Nazwa grupy:</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    maxLength={100}
                                    placeholder="Wprowadź nazwę grupy"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Opis:</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    maxLength={500}
                                    placeholder="Wprowadź opis grupy (opcjonalnie)"
                                    rows={3}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingGroup ? 'Zaktualizuj' : 'Utwórz'}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        cancelEdit();
                                        clearMessages();
                                    }}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Formularz dodawania członka */}
                {showAddMemberForm && selectedGroup && isAdmin && (
                    <div className="group-form-container">
                        <form onSubmit={handleAddMember} className="group-form">
                            <h3>Dodaj użytkownika do grupy: {selectedGroup.name}</h3>
                            
                            <div className="form-group">
                                <label htmlFor="username">Nazwa użytkownika:</label>
                                <div className="autocomplete-container">
                                    <input
                                        type="text"
                                        id="username"
                                        value={newMemberUsername}
                                        onChange={handleUsernameInputChange}
                                        placeholder="Wpisz nazwę użytkownika..."
                                        required
                                        autoComplete="off"
                                    />
                                    {showSuggestions && usernameSuggestions.length > 0 && (
                                        <div className="suggestions-dropdown">
                                            {usernameSuggestions.map(user => (
                                                <div
                                                    key={user.id}
                                                    className="suggestion-item"
                                                    onClick={() => selectUsername(user.username)}
                                                >
                                                    {user.username}
                                                    {user.firstName && user.lastName && (
                                                        <span className="user-fullname"> ({user.firstName} {user.lastName})</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {loadingUsers && <small>Ładowanie użytkowników...</small>}
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    Dodaj użytkownika
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={closeAddMemberForm}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista moich grup */}
                <div className="groups-section">
                    <div className="section-header">
                        <h2>Moje grupy</h2>
                    </div>
                    {myGroups.length === 0 ? (
                        <p className="no-groups">Nie należysz do żadnej grupy.</p>
                    ) : (
                        <div className="groups-grid">
                            {myGroups.map(group => (
                                <div key={group.id} className="group-card my-group">
                                    <div className="group-header">
                                        <h3>{group.name}</h3>
                                        <span className="member-count">
                                            {getMemberCount(group.id)} członków
                                        </span>
                                    </div>
                                    <p className="group-description">{group.description}</p>
                                    
                                    <div className="group-members">
                                        <div className="members-header">
                                            <h4>Członkowie:</h4>
                                            <button
                                                className="btn btn-icon btn-secondary members-modal-btn"
                                                onClick={() => openMembersModal(group)}
                                                title="Zobacz wszystkich członków"
                                            >
                                                <i className="bi bi-three-dots"></i>
                                            </button>
                                        </div>
                                        <div className="members-list">
                                            {getLimitedMembers(group.id).map(member => (
                                                <span key={member.id} className="member-tag">
                                                    {member.username}
                                                    {member.firstName && ` (${member.firstName} ${member.lastName})`}
                                                </span>
                                            ))}
                                            {getMemberCount(group.id) > 3 && (
                                                <span className="more-members">
                                                    +{getMemberCount(group.id) - 3} więcej
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="group-dates">
                                        <small>Utworzona: {new Date(group.createdAt).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lista wszystkich grup (tylko dla adminów) */}
                {isAdmin && (
                    <div className="groups-section">
                        <div className="section-header">
                            <h2>Wszystkie grupy</h2>
                        </div>
                        {groups.length === 0 ? (
                            <p className="no-groups">Brak grup w systemie.</p>
                        ) : (
                            <div className="groups-grid">
                                {groups.map(group => (
                                    <div key={group.id} className="group-card">
                                        <div className="group-header">
                                            <h3>{group.name}</h3>
                                            <span className="member-count">
                                                {getMemberCount(group.id)} członków
                                            </span>
                                        </div>
                                        <p className="group-description">{group.description}</p>
                                        
                                        <div className="group-members">
                                            <div className="members-header">
                                                <h4>Członkowie:</h4>
                                                <button
                                                    className="btn btn-icon btn-secondary members-modal-btn"
                                                    onClick={() => openMembersModal(group)}
                                                    title="Zobacz wszystkich członków"
                                                >
                                                    <i className="bi bi-three-dots"></i>
                                                </button>
                                            </div>
                                            <div className="members-list">
                                                {getLimitedMembers(group.id).map(member => (
                                                    <span key={member.id} className="member-tag">
                                                        {member.username}
                                                        {member.firstName && ` (${member.firstName} ${member.lastName})`}
                                                        <button
                                                            className="remove-member-btn"
                                                            onClick={() => handleRemoveMember(group.name, member.username)}
                                                            title="Usuń użytkownika z grupy"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                {getMemberCount(group.id) > 3 && (
                                                    <span className="more-members">
                                                        +{getMemberCount(group.id) - 3} więcej
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="group-actions">
                                            <button
                                                className="btn btn-icon btn-primary"
                                                onClick={() => openAddMemberForm(group)}
                                                title="Dodaj członka"
                                            >
                                                <i className="bi bi-person-plus"></i>
                                            </button>
                                            <button
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => startEdit(group)}
                                                title="Edytuj grupę"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-icon btn-danger"
                                                onClick={() => handleDeleteGroup(group.id)}
                                                title="Usuń grupę"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>

                                        <div className="group-dates">
                                            <small>Utworzona: {new Date(group.createdAt).toLocaleDateString()}</small>
                                            {group.updatedAt !== group.createdAt && (
                                                <small>Ostatnia modyfikacja: {new Date(group.updatedAt).toLocaleDateString()}</small>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Users Sidebar */}
            {isAdmin && (
                <div className={`users-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Użytkownicy</h3>
                        <button className="sidebar-close" onClick={toggleSidebar}>×</button>
                    </div>
                    <div className="sidebar-content">
                        {loadingUsers ? (
                            <p className="loading-message">Ładowanie...</p>
                        ) : allUsers.length === 0 ? (
                            <p className="no-users">Brak użytkowników</p>
                        ) : (
                            <div className="users-list">
                                {Array.isArray(allUsers) && allUsers.map(user => (
                                    <div key={user.id} className="user-item">
                                        <div className="user-info">
                                            <div className="username">{user.username}</div>
                                            {user.firstName && user.lastName && (
                                                <div className="fullname">{user.firstName} {user.lastName}</div>
                                            )}
                                            <div className="user-roles">
                                                {user.roles && Array.isArray(user.roles) && user.roles.map((role, index) => (
                                                    <span key={index} className="role-badge">
                                                        {typeof role === 'string' ? role.replace('ROLE_', '') : (role.name ? role.name.replace('ROLE_', '') : 'Unknown')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Members Modal */}
            {showMembersModal && modalGroup && (
                <div className="modal-overlay" onClick={closeMembersModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Członkowie grupy: {modalGroup.name}</h3>
                            <button className="modal-close" onClick={closeMembersModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-members-list">
                                {(groupMembers[modalGroup.id] || []).map(member => (
                                    <div key={member.id} className="modal-member-item">
                                        <div className="member-info">
                                            <div className="member-username">{member.username}</div>
                                            {member.firstName && member.lastName && (
                                                <div className="member-fullname">{member.firstName} {member.lastName}</div>
                                            )}
                                        </div>
                                        {isAdmin && (
                                            <button
                                                className="btn btn-icon btn-danger btn-sm"
                                                onClick={() => {
                                                    handleRemoveMember(modalGroup.name, member.username);
                                                    closeMembersModal();
                                                }}
                                                title="Usuń użytkownika z grupy"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(groupMembers[modalGroup.id] || []).length === 0 && (
                                    <p className="no-members">Brak członków w tej grupie</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </div>
    );
};

export default GroupManagement; 