import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QuizService from '../services/QuizService';
import GroupService from '../services/GroupService';
import AuthService from '../services/AuthService';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import './QuizList.css';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Sprawdź stan uwierzytelnienia
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const user = AuthService.getCurrentUser();
        
        console.log('🔐 Stan uwierzytelnienia:', {
            hasToken: !!token,
            tokenLength: token?.length,
            userId: userId,
            user: user,
            isAuthenticated: AuthService.isAuthenticated()
        });
        
        if (!AuthService.isAuthenticated()) {
            console.warn('⚠️ Użytkownik nie jest zalogowany!');
            // Możesz przekierować na stronę logowania
            // navigate('/login');
        }
        
        // Pobierz aktualnego użytkownika
        console.log('👤 Aktualny użytkownik:', user);
        setCurrentUser(user);
        
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        setLoading(true);
        try {
            // Pobierz grupy użytkownika
            const myGroupsResponse = await GroupService.getMyGroups();
            const groupIds = myGroupsResponse.data.map(group => group.id);
            
            // Pobierz quizy z uwzględnieniem grup
            const response = await QuizService.getAvailableQuizzes(groupIds);
            setQuizzes(response.data);
        } catch (err) {
            console.error('Błąd podczas pobierania quizów:', err);
            setError('Nie udało się pobrać listy quizów.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (quizId) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten quiz?')) {
            QuizService.deleteQuiz(quizId)
                .then(() => {
                    setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
                })
                .catch(err => {
                    console.error('Błąd podczas usuwania quizu:', err);
                    setError('Nie udało się usunąć quizu.');
                });
        }
    };

    const handlePublicToggle = async (quizId, currentStatus) => {
        console.log('🔄 handlePublicToggle wywołane:', { quizId, currentStatus, newStatus: !currentStatus });
        try {
            console.log('📤 Wysyłanie żądania aktualizacji statusu...');
            const response = await QuizService.updateQuizPublicStatus(quizId, !currentStatus);
            console.log('✅ Odpowiedź z serwera:', response);
            
            // Po aktualizacji statusu, ponownie załaduj listę quizów
            // aby upewnić się, że lista jest aktualna
            console.log('🔄 Ponowne ładowanie listy quizów...');
            await loadQuizzes();
            console.log('✅ Lista quizów załadowana ponownie');
        } catch (err) {
            console.error('❌ Błąd podczas zmiany statusu quizu:', err);
            console.error('❌ Szczegóły błędu:', err.response?.data || err.message);
            setError('Nie udało się zaktualizować statusu quizu: ' + (err.response?.data?.message || err.message));
        }
    };

    const startQuiz = (quizId) => {
        navigate(`/quizzes/${quizId}/play`);
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Ładowanie...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Dostępne quizy</h2>
                <Button variant="primary" as={Link} to="/quizzes/create">
                    Utwórz nowy quiz
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {quizzes.length === 0 ? (
                <Alert variant="info">
                    Brak dostępnych quizów. Stwórz nowy lub poczekaj aż pojawią się publiczne quizy.
                </Alert>
            ) : (
                <Table striped bordered hover responsive variant="dark">
                    <thead>
                        <tr>
                            <th>Nazwa</th>
                            <th>Opis</th>
                            <th>Liczba pytań</th>
                            <th>Status</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizzes.map(quiz => {
                            console.log('🔍 Renderowanie quizu:', { 
                                quizId: quiz.id, 
                                quizName: quiz.name,
                                quizUserId: quiz.userId, 
                                currentUserId: currentUser?.id,
                                isOwner: currentUser && quiz.userId === currentUser.id,
                                isPublic: quiz.isPublic
                            });
                            
                            return (
                                <tr key={quiz.id}>
                                    <td>{quiz.name}</td>
                                    <td>{quiz.description ? quiz.description.substring(0, 50) + (quiz.description.length > 50 ? '...' : '') : '-'}</td>
                                    <td>{quiz.questionCount}</td>
                                    <td>{quiz.isPublic ? 'Publiczny' : 'Prywatny'}</td>
                                    <td>
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            className="me-2 action-button play-button"
                                            onClick={() => startQuiz(quiz.id)}
                                            title="Start"
                                        >
                                            <i className="bi bi-play-fill"></i>
                                        </Button>
                                        <Button 
                                            variant="info" 
                                            size="sm" 
                                            className="me-2 action-button stats-button"
                                            as={Link}
                                            to={`/quizzes/${quiz.id}/results`}
                                            title="Moje wyniki"
                                        >
                                            <i className="bi bi-bar-chart-fill"></i>
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            size="sm" 
                                            className="me-2 action-button all-stats-button"
                                            as={Link}
                                            to={`/quizzes/${quiz.id}/statistics`}
                                            title="Statystyki wszystkich użytkowników"
                                        >
                                            <i className="bi bi-graph-up"></i>
                                        </Button>
                                        {/* Przycisk kłódki - tylko dla właściciela quizu */}
                                        {(() => {
                                            const isOwner = currentUser && quiz.userId === currentUser.id;
                                            console.log('🔒 Sprawdzanie właściciela dla quizu', quiz.id, ':', { isOwner, currentUser: currentUser?.id, quizUserId: quiz.userId });
                                            return isOwner;
                                        })() && (
                                            <Button 
                                                variant={quiz.isPublic ? "secondary" : "warning"} 
                                                size="sm" 
                                                className="me-2 action-button lock-button"
                                                onClick={() => {
                                                    console.log('🔒 Kliknięto przycisk kłódki:', { quizId: quiz.id, currentStatus: quiz.isPublic, userId: currentUser.id, quizUserId: quiz.userId });
                                                    handlePublicToggle(quiz.id, quiz.isPublic);
                                                }}
                                                title={quiz.isPublic ? 'Ustaw prywatny' : 'Ustaw publiczny'}
                                            >
                                                <i className={quiz.isPublic ? "bi bi-lock-fill" : "bi bi-unlock-fill"}></i>
                                            </Button>
                                        )}
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            className="action-button delete-button"
                                            onClick={() => handleDelete(quiz.id)}
                                            title="Usuń"
                                        >
                                            <i className="bi bi-trash-fill"></i>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default QuizList; 