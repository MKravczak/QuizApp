import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import QuizService from '../services/QuizService';

const QuizStatisticsList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response = await QuizService.getMyQuizzes();
            setQuizzes(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Błąd podczas pobierania quizów:', err);
            setError('Nie udało się załadować quizów. Spróbuj ponownie później.');
            setLoading(false);
        }
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
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Statystyki quizów</h2>
            
            {quizzes.length === 0 ? (
                <Alert variant="info">
                    Nie masz jeszcze żadnych quizów. Utwórz quiz, aby zobaczyć statystyki.
                </Alert>
            ) : (
                <Row className="g-4">
                    {quizzes.map(quiz => (
                        <Col key={quiz.id} md={6} lg={4}>
                            <Card className="h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{quiz.name}</Card.Title>
                                    <Card.Text className="text-muted mb-2">
                                        Liczba pytań: {quiz.questionCount}
                                    </Card.Text>
                                    {quiz.description && (
                                        <Card.Text className="small mb-3">{quiz.description}</Card.Text>
                                    )}
                                    <div className="mt-auto">
                                        <Link to={`/quizzes/${quiz.id}/statistics`} className="btn btn-primary w-100">
                                            Zobacz statystyki
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            
            <div className="mt-4">
                <Button variant="secondary" as={Link} to="/">
                    Powrót do strony głównej
                </Button>
            </div>
        </Container>
    );
};

export default QuizStatisticsList; 