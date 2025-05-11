import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import QuizService from '../services/QuizService';

const QuizPlay = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(0);
    const [finalTime, setFinalTime] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    useEffect(() => {
        loadQuiz();
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [quizId]);

    useEffect(() => {
        if (!loading && questions.length > 0) {
            startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        }
    }, [loading, questions]);

    const loadQuiz = async () => {
        try {
            setLoading(true);
            
            // Pobierz informacje o quizie
            const quizResponse = await QuizService.getQuiz(quizId);
            setQuiz(quizResponse.data);
            
            // Pobierz pytania do quizu
            const questionsResponse = await QuizService.generateQuizQuestions(quizId);
            setQuestions(questionsResponse.data);
            
            setLoading(false);
        } catch (err) {
            console.error('Błąd podczas ładowania quizu:', err);
            setError('Nie udało się załadować quizu. Spróbuj ponownie później.');
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswer(answerIndex);
    };

    const handleNextQuestion = () => {
        // Sprawdź, czy odpowiedź jest poprawna
        const currentQuestion = questions[currentQuestionIndex];
        if (selectedAnswer === currentQuestion.correctAnswerIndex) {
            setScore(score + 1);
        }

        // Przejdź do następnego pytania lub zakończ quiz
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        // Zatrzymaj timer i zapisz finalny czas
        if (timerRef.current) {
            clearInterval(timerRef.current);
            setFinalTime(timer);
        }

        // Sprawdź ostatnią odpowiedź
        const currentQuestion = questions[currentQuestionIndex];
        if (selectedAnswer === currentQuestion.correctAnswerIndex) {
            setScore(score + 1);
        }

        // Zapisz wynik
        try {
            const quizResult = {
                quizId: parseInt(quizId),
                score: selectedAnswer === currentQuestion.correctAnswerIndex ? score + 1 : score,
                totalQuestions: questions.length,
                durationInSeconds: timer
            };

            await QuizService.submitQuizResult(quizResult);
            setShowResult(true);
        } catch (err) {
            console.error('Błąd podczas zapisywania wyniku:', err);
            setError('Nie udało się zapisać wyniku quizu.');
            setShowResult(true);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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

    if (showResult) {
        const resultPercentage = Math.round((score / questions.length) * 100);
        let resultVariant = 'danger';
        if (resultPercentage >= 80) resultVariant = 'success';
        else if (resultPercentage >= 60) resultVariant = 'warning';
        else if (resultPercentage >= 40) resultVariant = 'info';

        return (
            <Container className="mt-5">
                <Card className="text-center">
                    <Card.Header>Quiz zakończony</Card.Header>
                    <Card.Body>
                        <Card.Title>Twój wynik: {score} / {questions.length}</Card.Title>
                        <ProgressBar 
                            now={resultPercentage}
                            variant={resultVariant}
                            label={`${resultPercentage}%`}
                            className="mb-4 result-progress"
                            style={{height: "30px", fontSize: "1.2rem", fontWeight: "bold"}}
                            animated
                        />
                        <Card.Text>
                            Czas: {formatTime(finalTime)}
                        </Card.Text>
                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="primary" onClick={() => navigate(`/quizzes/${quizId}/results`)}>
                                Zobacz historię wyników
                            </Button>
                            <Button variant="success" onClick={() => {
                                setCurrentQuestionIndex(0);
                                setSelectedAnswer(null);
                                setScore(0);
                                setShowResult(false);
                                setTimer(0);
                                startTimeRef.current = Date.now();
                                loadQuiz();
                            }}>
                                Rozwiąż ponownie
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                                Wróć do listy quizów
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>{quiz.name}</h3>
                <div className="timer">
                    <strong>Czas: {formatTime(timer)}</strong>
                </div>
            </div>

            <ProgressBar 
                now={progress} 
                label={`${currentQuestionIndex + 1} / ${questions.length}`}
                className="mb-4"
            />

            <Card>
                <Card.Body>
                    <Card.Title className="mb-4 text-center">
                        {currentQuestion.question}
                    </Card.Title>
                    
                    <div className="d-grid gap-3">
                        {currentQuestion.answers.map((answer, index) => (
                            <Button
                                key={index}
                                variant={selectedAnswer === index ? 'primary' : 'outline-secondary'}
                                className="text-start p-3"
                                onClick={() => handleAnswerSelect(index)}
                                disabled={selectedAnswer !== null && selectedAnswer !== index}
                            >
                                {answer}
                            </Button>
                        ))}
                    </div>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                    <div>
                        Pytanie {currentQuestionIndex + 1} z {questions.length}
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleNextQuestion}
                        disabled={selectedAnswer === null}
                    >
                        {currentQuestionIndex < questions.length - 1 ? 'Następne pytanie' : 'Zakończ quiz'}
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default QuizPlay; 