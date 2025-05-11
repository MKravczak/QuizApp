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
            FlashcardService.getDeck(deckId)
                .then(response => {
                    setSelectedDeckInfo({
                        flashcardCount: response.data.flashcards.length,
                        name: response.data.name
                    });
                    
                    // Ustaw domyślną liczbę pytań na liczbę fiszek w zestawie (max 10)
                    const defaultQuestionCount = Math.min(response.data.flashcards.length, 10);
                    setFormData(prev => ({
                        ...prev,
                        questionCount: defaultQuestionCount
                    }));
                })
                .catch(err => {
                    console.error('Błąd podczas pobierania informacji o zestawie:', err);
                    setSelectedDeckInfo(null);
                });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.flashcardDeckId) {
            setError('Wybierz zestaw fiszek.');
            return;
        }

        // Przygotuj dane do wysłania - przekonwertuj ID i questionCount na liczby
        const quizToCreate = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            flashcardDeckId: parseInt(formData.flashcardDeckId, 10),
            questionCount: parseInt(formData.questionCount, 10),
            isPublic: formData.isPublic
        };
        
        console.log('Dane quizu do utworzenia:', quizToCreate);
        console.log('Auth header:', localStorage.getItem('user'));

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
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Wybierz zestaw fiszek</Form.Label>
                    <Form.Select
                        name="flashcardDeckId"
                        value={formData.flashcardDeckId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Wybierz zestaw...</option>
                        {decks.map(deck => (
                            <option key={deck.id} value={deck.id}>
                                {deck.name} ({deck.flashcards.length} fiszek)
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {selectedDeckInfo && (
                    <Form.Group className="mb-3">
                        <Form.Label>Liczba pytań (max: {selectedDeckInfo.flashcardCount})</Form.Label>
                        <Form.Control
                            type="number"
                            name="questionCount"
                            value={formData.questionCount}
                            onChange={handleChange}
                            min={1}
                            max={selectedDeckInfo.flashcardCount}
                            required
                        />
                        <Form.Text className="text-muted">
                            Wybierz liczbę pytań, które pojawią się w quizie (maksymalnie tyle, ile jest fiszek w zestawie).
                        </Form.Text>
                    </Form.Group>
                )}

                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        name="isPublic"
                        label="Quiz publiczny (dostępny dla wszystkich użytkowników)"
                        checked={formData.isPublic}
                        onChange={handleChange}
                    />
                </Form.Group>

                <div className="d-flex gap-2">
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Tworzenie...</span>
                            </>
                        ) : 'Utwórz quiz'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                        Anuluj
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default QuizCreate; 