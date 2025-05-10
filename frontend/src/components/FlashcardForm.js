import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FlashcardService from '../services/FlashcardService';

const FlashcardForm = () => {
  const { deckId, flashcardId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!flashcardId;
  
  const [flashcard, setFlashcard] = useState({
    term: '',
    definition: '',
    deckId: deckId
  });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deck, setDeck] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    // Pobierz informacje o talii
    const loadDeckData = async () => {
      try {
        const deckData = await FlashcardService.getDeckById(deckId);
        setDeck(deckData);
      } catch (err) {
        console.error('Błąd podczas pobierania danych talii:', err);
        setError('Nie udało się pobrać informacji o talii.');
      }
    };

    // Jeśli jesteśmy w trybie edycji, pobierz dane fiszki
    const loadFlashcardData = async () => {
      try {
        const flashcardData = await FlashcardService.getFlashcardById(flashcardId);
        setFlashcard(flashcardData);
        
        // Jeśli fiszka ma obrazek, ustaw podgląd
        if (flashcardData.imagePath) {
          setImagePreview(flashcardData.imagePath);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Błąd podczas pobierania danych fiszki:', err);
        setError('Nie udało się pobrać danych fiszki.');
        setLoading(false);
      }
    };

    loadDeckData();
    if (isEditMode) {
      loadFlashcardData();
    }
  }, [deckId, flashcardId, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlashcard({
      ...flashcard,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setRemoveImage(false);
    
    // Tworzenie podglądu obrazka
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = (e) => {
    const { checked } = e.target;
    setRemoveImage(checked);
    if (checked) {
      setImageFile(null);
      setImagePreview(null);
    } else if (flashcard.imagePath) {
      setImagePreview(flashcard.imagePath);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!flashcard.term.trim() || !flashcard.definition.trim()) {
      setError('Termin i definicja są wymagane');
      return;
    }
    
    try {
      // Przygotuj dane do wysyłki
      const flashcardData = {
        ...flashcard,
        deckId: parseInt(deckId)
      };
      
      // Jeśli użytkownik zaznaczył usunięcie obrazka
      if (removeImage) {
        flashcardData.imagePath = null;
      }
      
      let savedFlashcard;
      
      if (isEditMode) {
        // Aktualizacja istniejącej fiszki
        savedFlashcard = await FlashcardService.updateFlashcard(flashcardId, flashcardData);
      } else {
        // Tworzenie nowej fiszki
        savedFlashcard = await FlashcardService.createFlashcard(flashcardData);
      }
      
      // Obsługa przesyłania obrazka, jeśli został wybrany
      if (imageFile && savedFlashcard && savedFlashcard.id) {
        const formData = new FormData();
        formData.append('file', imageFile);
        try {
          await FlashcardService.uploadImage(savedFlashcard.id, formData);
        } catch (imgError) {
          console.error('Błąd podczas przesyłania obrazu:', imgError);
          // Kontynuuj mimo błędu z obrazem
        }
      }
      
      // Przekieruj do widoku edycji talii
      navigate(`/decks/${deckId}/edit`);
    } catch (err) {
      console.error('Błąd podczas zapisywania fiszki:', err);
      setError('Nie udało się zapisać fiszki. Spróbuj ponownie później.');
    }
  };

  if (loading) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="mt-4">
      <div className="page-header">
        <h1 className="section-title">{isEditMode ? 'Edycja fiszki' : 'Nowa fiszka'}</h1>
        <div>
          <Link to={`/decks/${deckId}/edit`} className="btn btn-outline-secondary">
            Wróć do talii
          </Link>
        </div>
      </div>
      
      {deck && (
        <div className="card mb-4" style={{ backgroundColor: 'var(--light-purple)', color: 'white' }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Talia: {deck.name}</h4>
                {deck.description && <p className="mb-0 mt-1">{deck.description}</p>}
              </div>
              <span className={`badge ${deck.isPublic ? 'bg-info' : 'bg-secondary'}`}>
                {deck.isPublic ? 'Publiczna' : 'Prywatna'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: 'var(--primary-purple)', color: 'white' }}>
              <h4 className="mb-0">{isEditMode ? 'Edytuj fiszkę' : 'Utwórz nową fiszkę'}</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="term" className="form-label">Termin (przód fiszki)*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="term"
                    name="term"
                    value={flashcard.term || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="form-text">To pojawi się na przedniej stronie fiszki.</div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="definition" className="form-label">Definicja (tył fiszki)*</label>
                  <textarea
                    className="form-control"
                    id="definition"
                    name="definition"
                    value={flashcard.definition || ''}
                    onChange={handleInputChange}
                    rows="5"
                    required
                  ></textarea>
                  <div className="form-text">To pojawi się na tylnej stronie fiszki.</div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="imageFile" className="form-label">Obraz (opcjonalnie)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="imageFile"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <div className="form-text">
                    Maksymalny rozmiar pliku: 2MB. Obsługiwane formaty: JPG, PNG, GIF.
                  </div>
                  
                  {(imagePreview || flashcard.imagePath) && !removeImage && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <p className="mb-2">Podgląd obrazu:</p>
                      <div className="text-center">
                        <img 
                          src={imagePreview || flashcard.imagePath}
                          alt="Podgląd" 
                          className="img-fluid img-thumbnail" 
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                      
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="removeImage"
                          name="removeImage"
                          checked={removeImage}
                          onChange={handleRemoveImage}
                        />
                        <label className="form-check-label" htmlFor="removeImage">
                          Usuń obraz
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-end gap-2">
                  <Link to={`/decks/${deckId}/edit`} className="btn btn-outline-secondary">
                    Anuluj
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? 'Zapisz zmiany' : 'Utwórz fiszkę'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardForm; 