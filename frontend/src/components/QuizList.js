import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QuizService from '../services/QuizService';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import './QuizList.css';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = () => {
        setLoading(true);
        QuizService.getQuizzes()
            .then(response => {
                setQuizzes(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Błąd podczas pobierania quizów:', err);
                setError('Nie udało się pobrać listy quizów.');
                setLoading(false);
            });
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

    const handlePublicToggle = (quizId, currentStatus) => {
        QuizService.updateQuizPublicStatus(quizId, !currentStatus)
            .then(response => {
                setQuizzes(quizzes.map(quiz => 
                    quiz.id === quizId ? response.data : quiz
                ));
            })
            .catch(err => {
                console.error('Błąd podczas zmiany statusu quizu:', err);
                setError('Nie udało się zaktualizować statusu quizu.');
            });
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
                <Table striped bordered hover responsive>
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
                        {quizzes.map(quiz => (
                            <tr key={quiz.id}>
                                <td>{quiz.name}</td>
                                <td>{quiz.description ? quiz.description.substring(0, 50) + (quiz.description.length > 50 ? '...' : '') : '-'}</td>
                                <td>{quiz.questionCount}</td>
                                <td>{quiz.public ? 'Publiczny' : 'Prywatny'}</td>
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
                                        title="Wyniki"
                                    >
                                        <i className="bi bi-bar-chart-fill"></i>
                                    </Button>
                                    <Button 
                                        variant={quiz.public ? "secondary" : "warning"} 
                                        size="sm" 
                                        className="me-2 action-button lock-button"
                                        onClick={() => handlePublicToggle(quiz.id, quiz.public)}
                                        title={quiz.public ? 'Ustaw prywatny' : 'Ustaw publiczny'}
                                    >
                                        <i className={quiz.public ? "bi bi-lock-fill" : "bi bi-unlock-fill"}></i>
                                    </Button>
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
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default QuizList; 