import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FlashcardService from '../services/FlashcardService';
import '../styles/FlashcardDeckView.css';

const FlashcardDeckView = () => {
  const { id } = useParams();
  
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <Link to={`/decks/${id}/edit`} className="btn btn-primary me-2">
            <i className="bi bi-pencil-fill me-1"></i> Edytuj talię
          </Link>
          <Link 
            to={`/decks/${id}/anki`} 
            className="btn btn-success"
            title="Rozpocznij naukę w trybie Anki"
          >
            <i className="bi bi-layers-half me-1"></i> Tryb Anki
          </Link>
        </div>
      </div>
      
      {deck.description && (
        <div className="card mb-4 deck-description-card">
          <div className="card-body">
            <h5 className="card-title">Opis talii:</h5>
            <p className="lead mb-0">{deck.description}</p>
          </div>
        </div>
      )}
      
      <h4 className="section-title mb-3">Przegląd fiszek ({flashcards.length})</h4>
      
      {flashcards.length === 0 ? (
        <div className="alert alert-info">
          Ta talia nie zawiera jeszcze żadnych fiszek. <Link to={`/decks/${id}/edit`}>Dodaj fiszki</Link>, aby rozpocząć naukę.
        </div>
      ) : (
        <div className="row gy-4">
          {flashcards.map(flashcard => (
            <div className="col-md-6 col-lg-4" key={flashcard.id}>
              <div className="card flashcard-preview-card h-100">
                <div className="card-body">
                  <h5 className="card-title flashcard-term">{flashcard.term}</h5>
                  <hr/>
                  <p className="card-text flashcard-definition">{flashcard.definition}</p>
                  {flashcard.imagePath && (
                    <div className="mt-2 text-center">
                      <img 
                        src={flashcard.imagePath} 
                        alt={flashcard.term}
                        className="img-fluid rounded flashcard-preview-image"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardDeckView; 