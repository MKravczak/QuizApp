import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Card, Alert, Spinner, Row, Col, Badge, Tab, Tabs } from 'react-bootstrap';
import QuizService from '../services/QuizService';
import UserService from '../services/UserService';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Rejestracja komponentów wymaganych przez Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const QuizStatistics = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userStats, setUserStats] = useState({});
    const [usernames, setUsernames] = useState({});

    useEffect(() => {
        loadQuizAndResults();
    }, [quizId]);

    const loadQuizAndResults = async () => {
        try {
            setLoading(true);
            
            // Pobierz informacje o quizie
            const quizResponse = await QuizService.getQuiz(quizId);
            setQuiz(quizResponse.data);
            
            // Pobierz wszystkie wyniki dla quizu (tylko dla właściciela)
            const resultsResponse = await QuizService.getAllQuizResults(quizId);
            setAllResults(resultsResponse.data);
            
            // Pobierz nazwy użytkowników
            const uniqueUserIds = [...new Set(resultsResponse.data.map(result => result.userId))];
            if (uniqueUserIds.length > 0) {
                const usernamesResponse = await UserService.getUsernamesByIds(uniqueUserIds);
                setUsernames(usernamesResponse.data);
            }
            
            // Oblicz statystyki dla użytkowników
            calculateUserStatistics(resultsResponse.data);
            
            setLoading(false);
        } catch (err) {
            console.error('Błąd podczas ładowania danych:', err);
            setError('Nie udało się załadować statystyk quizu. Upewnij się, że masz uprawnienia do przeglądania tych danych.');
            setLoading(false);
        }
    };

    const calculateUserStatistics = (results) => {
        // Grupowanie wyników według użytkowników
        const userStatsMap = {};
        
        results.forEach(result => {
            if (!userStatsMap[result.userId]) {
                userStatsMap[result.userId] = {
                    userId: result.userId,
                    attempts: 0,
                    bestScore: 0,
                    averageScore: 0,
                    totalScore: 0,
                    bestTime: Number.MAX_VALUE,
                    averageTime: 0,
                    totalTime: 0,
                    results: []
                };
            }
            
            const userStat = userStatsMap[result.userId];
            userStat.attempts++;
            userStat.totalScore += result.score;
            userStat.totalTime += result.durationInSeconds;
            userStat.results.push(result);
            
            if (result.score > userStat.bestScore) {
                userStat.bestScore = result.score;
            }
            
            if (result.durationInSeconds < userStat.bestTime) {
                userStat.bestTime = result.durationInSeconds;
            }
        });
        
        // Oblicz średnie wartości
        Object.values(userStatsMap).forEach(stat => {
            stat.averageScore = stat.totalScore / stat.attempts;
            stat.averageTime = stat.totalTime / stat.attempts;
            
            // Sortuj wyniki chronologicznie
            stat.results.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
        });
        
        setUserStats(userStatsMap);
    };

    const getUsernameById = (userId) => {
        return usernames[userId] || `Użytkownik ${userId}`;
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

    // Przygotowanie danych dla wykresu wyników
    const prepareScoreChartData = () => {
        const labels = [];
        const datasets = [];
        
        // Przygotuj dane dla każdego użytkownika
        Object.values(userStats).forEach((userStat, index) => {
            const data = userStat.results.map(result => {
                const percentage = (result.score / result.totalQuestions) * 100;
                return percentage.toFixed(1);
            });
            
            // Przygotuj etykiety dat (tylko dla pierwszego użytkownika)
            if (index === 0) {
                userStat.results.forEach(result => {
                    labels.push(formatDate(result.completedAt));
                });
            }
            
            datasets.push({
                label: getUsernameById(userStat.userId),
                data,
                borderColor: getRandomColor(index),
                backgroundColor: getRandomColor(index, 0.2),
                tension: 0.1
            });
        });
        
        return { labels, datasets };
    };
    
    // Funkcja generująca losowy kolor dla wykresu
    const getRandomColor = (index, alpha = 1) => {
        const colors = [
            `rgba(255, 99, 132, ${alpha})`,
            `rgba(54, 162, 235, ${alpha})`,
            `rgba(255, 206, 86, ${alpha})`,
            `rgba(75, 192, 192, ${alpha})`,
            `rgba(153, 102, 255, ${alpha})`,
            `rgba(255, 159, 64, ${alpha})`,
            `rgba(199, 199, 199, ${alpha})`,
            `rgba(83, 102, 255, ${alpha})`,
            `rgba(40, 159, 64, ${alpha})`,
            `rgba(210, 199, 199, ${alpha})`
        ];
        return colors[index % colors.length];
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
                    <Card.Title>{quiz.name} - Statystyki</Card.Title>
                    <Card.Text>
                        <strong>Liczba pytań:</strong> {quiz.questionCount}<br />
                        {quiz.description && (
                            <><strong>Opis:</strong> {quiz.description}<br /></>
                        )}
                        <strong>Liczba prób:</strong> {allResults.length}<br />
                        <strong>Liczba uczestników:</strong> {Object.keys(userStats).length}
                    </Card.Text>
                    <div className="d-flex gap-2">
                        <Button variant="primary" onClick={() => navigate(`/quizzes/${quizId}/results`)}>
                            Moje wyniki
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                            Wróć do listy quizów
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {allResults.length === 0 ? (
                <Alert variant="info">
                    Brak wyników dla tego quizu. Poczekaj, aż użytkownicy rozwiążą quiz, aby zobaczyć statystyki.
                </Alert>
            ) : (
                <Tabs defaultActiveKey="summary" className="mb-4">
                    <Tab eventKey="summary" title="Podsumowanie">
                        <Row className="mt-4">
                            <Col md={6}>
                                <Card className="mb-4">
                                    <Card.Body>
                                        <Card.Title>Ogólne statystyki</Card.Title>
                                        <ul>
                                            <li>
                                                <strong>Średni wynik:</strong>{' '}
                                                {(allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length).toFixed(2)} / {quiz.questionCount}
                                                {' '}({((allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length / quiz.questionCount) * 100).toFixed(1)}%)
                                            </li>
                                            <li>
                                                <strong>Najlepszy wynik:</strong>{' '}
                                                {Math.max(...allResults.map(r => r.score))} / {quiz.questionCount}
                                                {' '}({((Math.max(...allResults.map(r => r.score)) / quiz.questionCount) * 100).toFixed(1)}%)
                                            </li>
                                            <li>
                                                <strong>Najgorszy wynik:</strong>{' '}
                                                {Math.min(...allResults.map(r => r.score))} / {quiz.questionCount}
                                                {' '}({((Math.min(...allResults.map(r => r.score)) / quiz.questionCount) * 100).toFixed(1)}%)
                                            </li>
                                            <li>
                                                <strong>Średni czas:</strong>{' '}
                                                {formatTime(Math.round(allResults.reduce((sum, r) => sum + r.durationInSeconds, 0) / allResults.length))}
                                            </li>
                                            <li>
                                                <strong>Najszybszy czas:</strong>{' '}
                                                {formatTime(Math.min(...allResults.map(r => r.durationInSeconds)))}
                                            </li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="mb-4">
                                    <Card.Body>
                                        <Card.Title>Wykres wyników</Card.Title>
                                        <div style={{ height: '300px' }}>
                                            {Object.keys(userStats).length > 0 && (
                                                <Line 
                                                    data={prepareScoreChartData()} 
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                max: 100,
                                                                title: {
                                                                    display: true,
                                                                    text: 'Wynik (%)'
                                                                }
                                                            },
                                                            x: {
                                                                title: {
                                                                    display: true,
                                                                    text: 'Data próby'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey="userStats" title="Statystyki użytkowników">
                        <Table striped bordered hover responsive className="mt-4">
                            <thead>
                                <tr>
                                    <th>Użytkownik</th>
                                    <th>Liczba prób</th>
                                    <th>Najlepszy wynik</th>
                                    <th>Średni wynik</th>
                                    <th>Najlepszy czas</th>
                                    <th>Średni czas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(userStats).map(stat => (
                                    <tr key={stat.userId}>
                                        <td>{getUsernameById(stat.userId)}</td>
                                        <td>{stat.attempts}</td>
                                        <td>
                                            {stat.bestScore} / {quiz.questionCount}
                                            {' '}({((stat.bestScore / quiz.questionCount) * 100).toFixed(1)}%)
                                        </td>
                                        <td>
                                            {stat.averageScore.toFixed(2)} / {quiz.questionCount}
                                            {' '}({((stat.averageScore / quiz.questionCount) * 100).toFixed(1)}%)
                                        </td>
                                        <td>{formatTime(stat.bestTime)}</td>
                                        <td>{formatTime(Math.round(stat.averageTime))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="allResults" title="Wszystkie próby">
                        <Table striped bordered hover responsive className="mt-4">
                            <thead>
                                <tr>
                                    <th>Użytkownik</th>
                                    <th>Data</th>
                                    <th>Wynik</th>
                                    <th>Procent</th>
                                    <th>Czas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allResults.map(result => {
                                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                                    return (
                                        <tr key={result.id}>
                                            <td>{getUsernameById(result.userId)}</td>
                                            <td>{formatDate(result.completedAt)}</td>
                                            <td>{result.score} / {result.totalQuestions}</td>
                                            <td>{percentage}%</td>
                                            <td>{formatTime(result.durationInSeconds)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
            )}
        </Container>
    );
};

export default QuizStatistics; 