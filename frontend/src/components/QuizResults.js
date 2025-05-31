import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Card, Alert, Spinner } from 'react-bootstrap';
import QuizService from '../services/QuizService';
import StatisticsService from '../services/StatisticsService';

const QuizResults = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        loadQuizAndResults();
    }, [quizId]);

    const loadQuizAndResults = async () => {
        try {
            setLoading(true);
            
            // Pobierz informacje o quizie z uwzględnieniem grup
            const quizResponse = await QuizService.getQuizWithGroups(quizId);
            setQuiz(quizResponse.data);
            
            // Sprawdź, czy użytkownik jest właścicielem quizu
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (currentUser && quizResponse.data.userId === currentUser.id) {
                setIsOwner(true);
            }
            
            // Pobierz wyniki dla quizu
            const resultsResponse = await StatisticsService.getQuizResults(quizId);
            setResults(resultsResponse.data);
            
            setLoading(false);
        } catch (err) {
            console.error('Błąd podczas ładowania danych:', err);
            setError('Nie udało się załadować wyników quizu.');
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
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

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navigate('/quizzes')}>
                    Wróć do listy quizów
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>{quiz.name} - Historia wyników</Card.Title>
                    <Card.Text>
                        <strong>Liczba pytań:</strong> {quiz.questionCount}<br />
                        {quiz.description && (
                            <><strong>Opis:</strong> {quiz.description}<br /></>
                        )}
                    </Card.Text>
                    <div className="d-flex gap-2">
                        <Button variant="primary" onClick={() => navigate(`/quizzes/${quizId}/play`)}>
                            Rozwiąż quiz
                        </Button>
                        {isOwner && (
                            <Button variant="info" onClick={() => navigate(`/quizzes/${quizId}/statistics`)}>
                                Zobacz statystyki wszystkich użytkowników
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                            Wróć do listy quizów
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {results.length === 0 ? (
                <Alert variant="info">
                    Brak wyników dla tego quizu. Rozwiąż quiz, aby zobaczyć tutaj wyniki.
                </Alert>
            ) : (
                <>
                    <h4>Twoje próby</h4>
                    <Table striped bordered hover responsive variant="dark">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Wynik</th>
                                <th>Procent</th>
                                <th>Czas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(result => {
                                const percentage = Math.round((result.score / result.totalQuestions) * 100);
                                return (
                                    <tr key={result.id}>
                                        <td>{formatDate(result.completedAt)}</td>
                                        <td>{result.score} / {result.totalQuestions}</td>
                                        <td>{percentage}%</td>
                                        <td>{formatTime(result.durationInSeconds)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>

                    <div className="mt-4">
                        <h5>Statystyki</h5>
                        <ul>
                            <li>
                                <strong>Najlepszy wynik:</strong>{' '}
                                {Math.max(...results.map(r => r.score))} / {quiz.questionCount}
                            </li>
                            <li>
                                <strong>Najszybszy czas:</strong>{' '}
                                {formatTime(Math.min(...results.map(r => r.durationInSeconds)))}
                            </li>
                            <li>
                                <strong>Średni wynik:</strong>{' '}
                                {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2)} / {quiz.questionCount}
                            </li>
                            <li>
                                <strong>Liczba prób:</strong> {results.length}
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </Container>
    );
};

export default QuizResults; 