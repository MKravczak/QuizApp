import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import QuizService from '../services/QuizService';
import StatisticsService from '../services/StatisticsService';

const QuizPlay = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    // Przeniesione definicje kolorów na poziom komponentu
    const red = 'rgb(255, 0, 0)';
    const orange = 'rgb(255, 165, 0)';
    const yellow = 'rgb(255, 255, 0)';
    const lightGreen = 'rgb(144, 238, 144)';
    const green = 'rgb(0, 128, 0)';
    const darkGreen = 'rgb(0, 100, 0)';

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
    const [resultPercentage, setResultPercentage] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    // Funkcja pomocnicza do obliczania koloru lub gradientu paska
    const getProgressBarBackground = (percentage) => {
        // Definicje kolorów są teraz na poziomie komponentu, więc są dostępne tutaj
        // Nie ma potrzeby ich ponownego definiowania

        if (percentage <= 30) {
            return red; // Czerwony
        } else if (percentage <= 50) {
            // Gradient czerwony -> pomarańczowy
            const factor = (percentage - 30) / (50 - 30);
            const r = Math.round(255);
            const g = Math.round(0 + 165 * factor);
            const b = 0;
            return `linear-gradient(90deg, ${red}, rgb(${r},${g},${b}))`;
        } else if (percentage <= 66) {
            // Gradient pomarańczowy -> żółty
            const factor = (percentage - 50) / (66 - 50);
            const r = 255;
            const g = Math.round(165 + (255 - 165) * factor);
            const b = 0;
            return `linear-gradient(90deg, ${orange}, rgb(${r},${g},${b}))`;
        } else if (percentage <= 75) {
            // Gradient żółty -> jasnozielony
            const factor = (percentage - 66) / (75 - 66);
            const r = Math.round(255 - (255 - 144) * factor);
            const g = Math.round(255 + (238 - 255) * factor);
            const b = Math.round(0 + 144 * factor);
            return `linear-gradient(90deg, ${yellow}, rgb(${r},${g},${b}))`;
        } else if (percentage <= 90) {
            // Gradient jasnozielony -> zielony
            const factor = (percentage - 75) / (90 - 75);
            const r = Math.round(144 - 144 * factor);
            const g = Math.round(238 - (238 - 128) * factor);
            const b = Math.round(144 - 144 * factor);
            return `linear-gradient(90deg, ${lightGreen}, rgb(${r},${g},${b}))`;
        } else {
            // Powyżej 90% do 100% - ciemnozielony
            // Można też zrobić gradient zielony -> ciemnozielony, jeśli jest taka potrzeba
            // Na razie, dla uproszczenia, stały ciemnozielony dla 90-100
            return darkGreen;
        }
    };
    
    // Funkcja do określenia koloru dla tekstu komunikatu
    const getResultTextColor = (percentage) => {
        // Kolory są teraz dostępne z zasięgu komponentu
        if (percentage < 50) return red;
        if (percentage < 75) return orange;
        return green;
    };

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
    
    // Efekt do animacji paska postępu po zakończeniu quizu
    useEffect(() => {
        if (showResult) {
            const progressBar = document.querySelector('.result-progress .progress-bar');
            if (progressBar) {
                // Najpierw ustawiamy szerokość na 0, aby animacja działała płynnie
                progressBar.style.width = '0%';
                // Dodajemy odstęp czasowy dla lepszego efektu
                setTimeout(() => {
                    progressBar.style.width = `${resultPercentage}%`;
                }, 100);
            }
        }
    }, [showResult, resultPercentage]);

    const loadQuiz = async () => {
        try {
            setLoading(true);
            
            // Pobierz informacje o quizie
            const quizResponse = await QuizService.getQuiz(quizId);
            setQuiz(quizResponse.data);
            
            // Pobierz pytania do quizu
            const questionsResponse = await QuizService.getQuizQuestions(quizId);
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
            // Przekażmy aktualny wynik do finishQuiz, aby uwzględnić ostatnie pytanie
            const finalScore = selectedAnswer === currentQuestion.correctAnswerIndex ? score + 1 : score;
            finishQuiz(finalScore);
        }
    };

    const finishQuiz = async (finalScore) => {
        const finishTime = Date.now();
        const totalTimeInSeconds = Math.round((finishTime - startTimeRef.current) / 1000);
        setFinalTime(totalTimeInSeconds);
        
        try {
            // Przygotuj dane do wysłania
            const resultData = {
                quizId: parseInt(quizId),
                quizName: quiz.name,
                score: finalScore,
                totalQuestions: questions.length,
                durationInSeconds: totalTimeInSeconds
            };
            
            // Wyślij wynik do serwisu statystyk
            await StatisticsService.submitQuizResult(resultData);
            setScore(finalScore);
            
            // Ustaw wynik procentowy
            const percentage = Math.round((finalScore / questions.length) * 100);
            setResultPercentage(percentage);
        } catch (error) {
            console.error('Błąd przy zapisywaniu wyniku:', error);
        }
        
        setShowResult(true);
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
        const progressBarBackgroundStyle = getProgressBarBackground(resultPercentage);
        const messageTextColor = getResultTextColor(resultPercentage);

        return (
            <Container className="mt-5">
                <Card className="text-center">
                    <Card.Header>Quiz zakończony</Card.Header>
                    <Card.Body>
                        <Card.Title className="mb-3">Twój wynik: {score} / {questions.length}</Card.Title>
                        
                        <div className="position-relative mb-4 result-progress">
                            <ProgressBar 
                                now={resultPercentage}
                                label={`${resultPercentage}%`}
                                style={{
                                    height: "35px", 
                                    fontSize: "1.2rem", 
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    backgroundColor: '#000000', // Czarne tło dla paska
                                    boxShadow: `0 4px 15px rgba(0, 0, 0, 0.2)`,
                                }}
                            >
                                <div 
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ 
                                        width: `${resultPercentage}%`, 
                                        background: progressBarBackgroundStyle, // Używamy background zamiast backgroundColor
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: '#fff', 
                                        borderRadius: "8px",
                                        transition: "width 1.5s cubic-bezier(0.23, 1, 0.32, 1), background 1.5s ease" // Zmieniono na background
                                    }}
                                    aria-valuenow={resultPercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {`${resultPercentage}%`}
                                </div>
                            </ProgressBar>
                            
                            <div 
                                className="position-absolute" 
                                style={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: "8px",
                                    pointerEvents: "none",
                                    zIndex: 1 
                                }}
                            />
                        </div>
                        
                        {/* Komunikat słowny zależny od wyniku */}
                        <Card.Text className="mb-4" style={{color: messageTextColor, fontWeight: "bold", fontSize: "1.1rem"}}>
                            {resultPercentage < 50 ? 'Spróbuj jeszcze raz, możesz lepiej!' : 
                             resultPercentage < 66 ? 'Całkiem nieźle, ale potrzebujesz więcej praktyki.' : 
                             resultPercentage < 75 ? 'Dobry wynik!' : 
                             resultPercentage < 90 ? 'Bardzo dobry wynik!' : 
                             'Świetny wynik, perfekcyjnie!'}
                        </Card.Text>
                        
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

    // Add safety check for currentQuestion
    if (!currentQuestion) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Ładowanie pytań...</span>
                </Spinner>
            </Container>
        );
    }

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
                className="mb-4 quiz-progress"
                variant="success"
                style={{
                    height: "20px", 
                    fontSize: "0.9rem", 
                    fontWeight: "bold",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}
            />

            <Card className="quiz-question-card">
                <Card.Body>
                    <Card.Title className="mb-4 text-center fs-4 fw-bold">
                        {currentQuestion.question}
                    </Card.Title>
                    
                    <div className="d-grid gap-3 quiz-answers">
                        {currentQuestion.answers.map((answer, index) => (
                            <Button
                                key={index}
                                variant="outline-secondary"
                                className={`text-start p-3 quiz-answer-option ${selectedAnswer === index ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(index)}
                                style={{
                                    backgroundColor: selectedAnswer === index ? 'var(--accent-primary)' : 'rgba(17, 25, 40, 0.8)',
                                    color: selectedAnswer === index ? 'white' : 'var(--text-primary)',
                                    fontWeight: selectedAnswer === index ? '600' : '400',
                                    borderColor: selectedAnswer === index ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                                    boxShadow: selectedAnswer === index ? '0 4px 15px rgba(7, 167, 127, 0.4)' : 'none',
                                    opacity: selectedAnswer !== null && selectedAnswer !== index ? 0.6 : 1,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {answer}
                            </Button>
                        ))}
                    </div>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    <div className="quiz-question-counter">
                        Pytanie {currentQuestionIndex + 1} z {questions.length}
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleNextQuestion}
                        disabled={selectedAnswer === null}
                        className="quiz-next-button"
                    >
                        {currentQuestionIndex < questions.length - 1 ? 'Następne pytanie' : 'Zakończ quiz'}
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default QuizPlay; 