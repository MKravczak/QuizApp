import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import FlashcardService from '../services/FlashcardService';
import '../styles/AnkiMode.css';

const FlashcardAnkiMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationInProgress, setAnimationInProgress] = useState(false);

  useEffect(() => {
    loadDeckData();
  }, [id]);

  useEffect(() => {
    // Aktualizuj postęp
    if (flashcards.length > 0) {
      setProgress(((currentCardIndex + 1) / flashcards.length) * 100);
    }
  }, [currentCardIndex, flashcards.length]);

  const loadDeckData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const deckData = await FlashcardService.getDeckById(id);
      setDeck(deckData);
      
      const flashcardsData = await FlashcardService.getFlashcardsByDeckId(id);
      if (flashcardsData.length === 0) {
        setError('Ta talia nie zawiera żadnych fiszek.');
      } else {
        setFlashcards(flashcardsData);
      }
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
    setIsFlipped(false);
  };

  const resetCards = () => {
    loadDeckData();
    setCurrentCardIndex(0);
    setShuffled(false);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (animationInProgress) return;
    
    setAnimationInProgress(true);
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setCurrentCardIndex(0);
      }
      setAnimationInProgress(false);
    }, 300); // Poczekaj na zakończenie animacji odwracania
  };

  const prevCard = () => {
    if (animationInProgress) return;
    
    setAnimationInProgress(true);
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      } else {
        setCurrentCardIndex(flashcards.length - 1);
      }
      setAnimationInProgress(false);
    }, 300); // Poczekaj na zakończenie animacji odwracania
  };

  const flipCard = () => {
    if (animationInProgress) return;
    setIsFlipped(!isFlipped);
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
        <Link to={`/decks/${id}`} className="btn btn-primary me-2">
          Wróć do widoku talii
        </Link>
        <Link to="/decks" className="btn btn-outline-secondary">
          Wróć do listy talii
        </Link>
      </div>
    );
  }

  if (!deck || flashcards.length === 0) {
    return (
      <div className="mt-4">
        <div className="alert alert-warning" role="alert">
          {!deck ? 'Nie znaleziono talii o podanym ID.' : 'Ta talia nie zawiera żadnych fiszek.'}
        </div>
        <Link to="/decks" className="btn btn-primary">
          Wróć do listy talii
        </Link>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentCardIndex];

  return (
    <div className="anki-mode-container mt-4">
      <div className="page-header mb-4">
        <h1 className="section-title">Tryb Anki: {deck.name}</h1>
        <div>
          <Link to={`/decks/${id}`} className="btn btn-outline-secondary me-2">
            Wróć do talii
          </Link>
          <button
            className={`btn ${shuffled ? 'btn-outline-primary' : 'btn-primary'} me-2`}
            onClick={shuffled ? resetCards : shuffleCards}
          >
            {shuffled ? 'Oryginalna kolejność' : 'Wymieszaj fiszki'}
          </button>
        </div>
      </div>

      <div className="progress mb-4" style={{ height: '10px' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <div className="card-counter mb-3 text-center">
        Fiszka {currentCardIndex + 1} z {flashcards.length}
      </div>

      <div className="anki-flashcard-layout">
        <button
          className="anki-nav-arrow anki-prev-arrow"
          onClick={prevCard}
          disabled={animationInProgress}
          aria-label="Poprzednia fiszka"
        >
          &lt;
        </button>
        
        <div className="anki-card-container">
          <div 
            className={`anki-card ${isFlipped ? 'flipped' : ''}`} 
            onClick={flipCard}
          >
            <div className="anki-card-front">
              <div className="anki-card-content">
                <h2>{currentFlashcard.term}</h2>
                <p className="text-muted mt-4 anki-card-instruction">Kliknij kartę, aby ją odwrócić</p>
              </div>
            </div>
            <div className="anki-card-back">
              <div className="anki-card-content">
                <h4 className="anki-card-back-term mb-3">{currentFlashcard.term}</h4>
                <p className="anki-card-back-definition">{currentFlashcard.definition}</p>
                {currentFlashcard.imagePath && (
                  <div className="mt-3 text-center">
                    <img
                      src={currentFlashcard.imagePath}
                      alt={currentFlashcard.term}
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <button
          className="anki-nav-arrow anki-next-arrow"
          onClick={nextCard}
          disabled={animationInProgress}
          aria-label="Następna fiszka"
        >
          &gt;
        </button>
      </div>
      
      <div className="anki-flip-button-container">
        <button
          className="btn btn-lg btn-primary"
          onClick={flipCard}
          disabled={animationInProgress}
        >
          <i className="bi bi-arrow-repeat"></i> Odwróć
        </button>
      </div>
    </div>
  );
};

export default FlashcardAnkiMode; 