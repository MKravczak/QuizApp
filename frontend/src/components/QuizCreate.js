import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import FlashcardService from '../services/FlashcardService';
import QuizService from '../services/QuizService';

const QuizCreate = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        flashcardDeckId: '',
        questionCount: 5,
        isPublic: false
    });
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDeckInfo, setSelectedDeckInfo] = useState(null);
    const [selectedFlashcards, setSelectedFlashcards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadDecks();
    }, []);

    const loadDecks = () => {
        setLoading(true);
        FlashcardService.getDecks()
            .then(response => {
                setDecks(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Błąd podczas pobierania zestawów fiszek:', err);
                setError('Nie udało się pobrać zestawów fiszek.');
                setLoading(false);
            });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setFormData({
            ...formData,
            [name]: val
        });

        // Jeśli zmieniono zestaw fiszek, pobierz informacje o nim
        if (name === 'flashcardDeckId' && val) {
            const deckId = parseInt(val);
            console.log('🔍 Pobieranie danych dla talii ID:', deckId);
            
            Promise.all([
                FlashcardService.getDeckById(deckId),
                FlashcardService.getFlashcardsByDeckId(deckId)
            ])
                .then(([deckData, flashcardsData]) => {
                    console.log('✅ Odpowiedź z getDeckById:', deckData);
                    console.log('📚 Fiszki:', flashcardsData, 'Liczba:', flashcardsData.length);
                    
                    setSelectedDeckInfo({
                        flashcardCount: flashcardsData.length,
                        name: deckData.name
                    });
                    setSelectedFlashcards(flashcardsData);
                    
                    // Ustaw domyślną liczbę pytań na liczbę fiszek w zestawie
                    const defaultQuestionCount = flashcardsData.length;
                    console.log('🔢 Ustawianie domyślnej liczby pytań na:', defaultQuestionCount);
                    setFormData(prev => ({
                        ...prev,
                        questionCount: defaultQuestionCount
                    }));
                })
                .catch(err => {
                    console.error('❌ Błąd podczas pobierania informacji o zestawie:', err);
                    setSelectedDeckInfo(null);
                    setSelectedFlashcards([]);
                });
        }
    };

    const generateQuestionsFromFlashcards = (flashcards, count) => {
        // Losowo wybieramy fiszki
        const shuffledFlashcards = [...flashcards].sort(() => 0.5 - Math.random());
        const selectedFlashcards = shuffledFlashcards.slice(0, count);
        
        // Generujemy pytania
        const questions = selectedFlashcards.map(flashcard => {
            const correctAnswer = flashcard.definition;
            
            // Wybieramy błędne odpowiedzi z innych fiszek
            const otherDefinitions = flashcards
                .filter(f => f.id !== flashcard.id)
                .map(f => f.definition);
            
            // Losowo wybieramy 3 (lub mniej, jeśli nie ma wystarczająco) błędne odpowiedzi
            const wrongAnswers = otherDefinitions
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.min(3, otherDefinitions.length));
            
            // Łączymy wszystkie odpowiedzi i mieszamy
            const allAnswers = [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
            
            // Znajdź indeks poprawnej odpowiedzi
            const correctAnswerIndex = allAnswers.indexOf(correctAnswer);
            
            return {
                question: flashcard.term,
                answers: allAnswers,
                correctAnswerIndex: correctAnswerIndex
            };
        });
        
        return questions;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('🐛 DEBUG handleSubmit:', {
            formData,
            selectedFlashcards: selectedFlashcards,
            selectedFlashcardsLength: selectedFlashcards.length,
            questionCount: formData.questionCount,
            selectedDeckInfo
        });
        
        if (!formData.flashcardDeckId) {
            setError('Wybierz zestaw fiszek.');
            return;
        }
        
        if (selectedFlashcards.length < formData.questionCount) {
            console.error('❌ Za mało fiszek:', {
                selectedFlashcardsLength: selectedFlashcards.length,
                questionCount: formData.questionCount
            });
            setError('Zbyt mała liczba fiszek w zestawie dla wybranej liczby pytań.');
            return;
        }

        // Generujemy pytania na podstawie fiszek
        const questions = generateQuestionsFromFlashcards(selectedFlashcards, parseInt(formData.questionCount, 10));

        // Przygotuj dane do wysłania zgodnie z nowym API
        const quizToCreate = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            questionCount: parseInt(formData.questionCount, 10),
            isPublic: formData.isPublic,
            questions: questions
        };
        
        console.log('Dane quizu do utworzenia:', quizToCreate);

        setLoading(true);
        QuizService.createQuiz(quizToCreate)
            .then((response) => {
                console.log('Odpowiedź po utworzeniu quizu:', response);
                navigate('/quizzes');
            })
            .catch(err => {
                console.error('Błąd podczas tworzenia quizu:', err);
                if (err.response) {
                    console.error('Status błędu:', err.response.status);
                    console.error('Dane błędu:', err.response.data);
                    
                    if (err.response.data && err.response.data.message) {
                        setError(`Nie udało się utworzyć quizu: ${err.response.data.message}`);
                    } else {
                        setError(`Nie udało się utworzyć quizu (status: ${err.response.status})`);
                    }
                } else if (err.request) {
                    console.error('Błąd żądania:', err.request);
                    setError('Nie udało się połączyć z serwerem. Sprawdź połączenie internetowe.');
                } else {
                    setError(`Nieznany błąd: ${err.message}`);
                }
                setLoading(false);
            });
    };

    if (loading && decks.length === 0) {
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
            <h2>Utwórz nowy quiz</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nazwa quizu</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="quiz-form-control"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px'
                        }}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Opis (opcjonalnie)</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="quiz-form-control"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px'
                        }}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Wybierz zestaw fiszek</Form.Label>
                    <Form.Select 
                        name="flashcardDeckId"
                        value={formData.flashcardDeckId}
                        onChange={handleChange}
                        required
                        className="quiz-form-control"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px'
                        }}
                    >
                        <option value="">Wybierz zestaw...</option>
                        {decks.map(deck => (
                            <option key={deck.id} value={deck.id}>
                                {deck.name} ({deck.flashcards?.length || 0} fiszek)
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Liczba pytań</Form.Label>
                    <Form.Control
                        type="number"
                        name="questionCount"
                        value={formData.questionCount}
                        onChange={handleChange}
                        min={1}
                        max={selectedDeckInfo ? selectedDeckInfo.flashcardCount : 20}
                        required
                        className="quiz-form-control"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px'
                        }}
                    />
                    {selectedDeckInfo && (
                        <Form.Text className="text-muted">
                            Maksymalna liczba pytań: {selectedDeckInfo.flashcardCount}
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Check
                        type="checkbox"
                        id="isPublic"
                        name="isPublic"
                        label="Quiz publiczny"
                        checked={formData.isPublic}
                        onChange={handleChange}
                        className="quiz-form-check"
                        style={{
                            color: 'var(--text-primary)'
                        }}
                    />
                </Form.Group>

                <div className="d-flex justify-content-end">
                    <Button 
                        variant="secondary" 
                        onClick={() => navigate('/quizzes')}
                        className="me-2"
                    >
                        Anuluj
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading || !formData.flashcardDeckId}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Tworzenie...
                            </>
                        ) : 'Utwórz quiz'}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default QuizCreate; 