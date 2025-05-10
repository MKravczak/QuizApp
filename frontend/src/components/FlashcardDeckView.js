import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FlashcardService from '../services/FlashcardService';

const FlashcardDeckView = () => {
  const { id } = useParams();
  
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    loadDeckData();
  }, [id]);

  const loadDeckData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const deckData = await FlashcardService.getDeckById(id);
      setDeck(deckData);
      
      const flashcardsData = await FlashcardService.getFlashcardsByDeckId(id);
      setFlashcards(flashcardsData);
    } catch (err) {
      console.error('Błąd podczas pobierania danych talii:', err);
      setError('Nie udało się pobrać danych talii. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  const shuffleCards = () => {
    const shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffledCards);
    setCurrentCardIndex(0);
    setShuffled(true);
    setShowAnswer(false);
  };

  const resetCards = () => {
    loadDeckData();
    setCurrentCardIndex(0);
    setShuffled(false);
    setShowAnswer(false);
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Powrót do pierwszej karty po dojściu do końca
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    } else {
      // Przejście do ostatniej karty
      setCurrentCardIndex(flashcards.length - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return (
      <div className="mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/decks" className="btn btn-primary">
          Wróć do listy talii
        </Link>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="mt-4">
        <div className="alert alert-warning" role="alert">
          Nie znaleziono talii o podanym ID.
        </div>
        <Link to="/decks" className="btn btn-primary">
          Wróć do listy talii
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="page-header">
        <h1 className="section-title">{deck.name}</h1>
        <div>
          <Link to="/decks" className="btn btn-outline-secondary me-2">
            Wróć do listy
          </Link>
          <Link to={`/decks/${id}/edit`} className="btn btn-primary">
            Edytuj talię
          </Link>
        </div>
      </div>
      
      {deck.description && (
        <div className="card mb-4">
          <div className="card-body">
            <p className="lead mb-0">{deck.description}</p>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="section-title mb-0">
            {studyMode ? 'Tryb nauki' : 'Przegląd fiszek'} 
            <span className="badge bg-primary ms-2">{flashcards.length}</span>
          </h4>
          <div>
            <button 
              className={`btn ${studyMode ? 'btn-outline-primary' : 'btn-primary'} me-2`}
              onClick={() => setStudyMode(!studyMode)}
            >
              {studyMode ? 'Wyłącz tryb nauki' : 'Włącz tryb nauki'}
            </button>
            <button 
              className={`btn ${shuffled ? 'btn-outline-secondary' : 'btn-secondary'} me-2`}
              onClick={shuffled ? resetCards : shuffleCards}
              disabled={flashcards.length < 2}
            >
              {shuffled ? 'Resetuj kolejność' : 'Losowa kolejność'}
            </button>
          </div>
        </div>
        
        {flashcards.length === 0 ? (
          <div className="alert alert-info">
            Ta talia nie zawiera jeszcze żadnych fiszek.
          </div>
        ) : studyMode ? (
          // Tryb nauki
          <div className="study-mode">
            <div className="progress mb-3">
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${(currentCardIndex + 1) / flashcards.length * 100}%` }}
                aria-valuenow={currentCardIndex + 1}
                aria-valuemin="0"
                aria-valuemax={flashcards.length}
              >
                {currentCardIndex + 1} / {flashcards.length}
              </div>
            </div>
            
            <div className="flashcard mb-4 mx-auto" style={{ maxWidth: '600px' }}>
              <div className={`flashcard-inner ${showAnswer ? 'flipped' : ''}`}>
                <div className="flashcard-front">
                  <h3>{flashcards[currentCardIndex].term}</h3>
                  <p className="mt-3 text-white-50">Kliknij, aby zobaczyć odpowiedź</p>
                </div>
                <div className="flashcard-back">
                  <h5 className="text-muted mb-3">{flashcards[currentCardIndex].term}</h5>
                  <p>{flashcards[currentCardIndex].definition}</p>
                  {flashcards[currentCardIndex].imagePath && (
                    <div className="mt-3">
                      <img 
                        src={flashcards[currentCardIndex].imagePath} 
                        alt={flashcards[currentCardIndex].term}
                        className="img-fluid" 
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between">
              <button 
                className="btn btn-outline-secondary"
                onClick={prevCard}
              >
                &laquo; Poprzednia
              </button>
              <button 
                className="btn btn-primary"
                onClick={toggleAnswer}
              >
                {showAnswer ? 'Pokaż pytanie' : 'Pokaż odpowiedź'}
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={nextCard}
              >
                Następna &raquo;
              </button>
            </div>
          </div>
        ) : (
          // Tryb przeglądania
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: '40%' }}>Termin</th>
                    <th scope="col" style={{ width: '60%' }}>Definicja</th>
                  </tr>
                </thead>
                <tbody>
                  {flashcards.map(flashcard => (
                    <tr key={flashcard.id}>
                      <td className="fw-medium">{flashcard.term}</td>
                      <td>
                        {flashcard.definition}
                        {flashcard.imagePath && (
                          <div className="mt-2">
                            <small className="text-primary">Posiada obraz</small>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardDeckView; 