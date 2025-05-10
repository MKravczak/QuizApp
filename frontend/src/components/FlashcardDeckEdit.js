import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FlashcardService from '../services/FlashcardService';

const FlashcardDeckEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState({ name: '', description: '', isPublic: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [importType, setImportType] = useState('');
  const [importFile, setImportFile] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDeck({
      ...deck,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deck.name.trim()) {
      setError('Nazwa talii jest wymagana');
      return;
    }
    
    try {
      await FlashcardService.updateDeck(id, deck);
      setError(null);
      alert('Talia została zaktualizowana.');
    } catch (err) {
      console.error('Błąd podczas aktualizacji talii:', err);
      setError('Nie udało się zaktualizować talii. Spróbuj ponownie później.');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!importFile) {
      setError('Wybierz plik do importu.');
      return;
    }
    
    try {
      let updatedDeck;
      
      if (importType === 'csv') {
        updatedDeck = await FlashcardService.importFlashcardsFromCSV(id, importFile);
      } else if (importType === 'txt') {
        updatedDeck = await FlashcardService.importFlashcardsFromTxt(id, importFile);
      }
      
      if (updatedDeck) {
        setDeck(updatedDeck);
        await loadDeckData();
        setImportFile(null);
        setImportType('');
        alert('Fiszki zostały zaimportowane.');
      }
    } catch (err) {
      console.error('Błąd podczas importu fiszek:', err);
      setError('Nie udało się zaimportować fiszek. Sprawdź format pliku i spróbuj ponownie.');
    }
  };

  const handleAddFlashcard = async () => {
    navigate(`/decks/${id}/flashcards/new`);
  };

  const handleEditFlashcard = (flashcardId) => {
    navigate(`/decks/${id}/flashcards/${flashcardId}/edit`);
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę fiszkę? Ta operacja jest nieodwracalna.')) {
      try {
        await FlashcardService.deleteFlashcard(flashcardId);
        await loadDeckData();
      } catch (err) {
        console.error('Błąd podczas usuwania fiszki:', err);
        setError('Nie udało się usunąć fiszki. Spróbuj ponownie później.');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="mt-4">
      <div className="page-header">
        <h1 className="section-title">Edycja talii: {deck.name}</h1>
        <div>
          <Link to="/decks" className="btn btn-outline-secondary me-2">
            Wróć do listy
          </Link>
          <Link to={`/decks/${id}`} className="btn btn-primary">
            Przeglądaj talię
          </Link>
        </div>
      </div>
      
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
        <div className="col-md-5">
          <div className="card mb-4" style={{ backgroundColor: deck.isPublic ? 'var(--light-blue)' : 'var(--light-purple)', color: 'white' }}>
            <div className="card-body">
              <h4 className="card-title">Informacje o talii</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nazwa*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={deck.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Opis</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={deck.description || ''}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isPublic"
                    name="isPublic"
                    checked={deck.isPublic}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="isPublic">Publiczna</label>
                </div>
                <button type="submit" className="btn btn-light">Zapisz zmiany</button>
              </form>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Import fiszek</h4>
              <form onSubmit={handleImport}>
                <div className="mb-3">
                  <label htmlFor="importType" className="form-label">Format pliku</label>
                  <select
                    className="form-select"
                    id="importType"
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    required
                  >
                    <option value="">Wybierz format...</option>
                    <option value="csv">CSV</option>
                    <option value="txt">TXT</option>
                  </select>
                  <div className="form-text">
                    Format CSV: term,definition<br />
                    Format TXT: term::definition (każda fiszka w osobnej linii)
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="importFile" className="form-label">Plik</label>
                  <input
                    type="file"
                    className="form-control"
                    id="importFile"
                    onChange={handleFileChange}
                    accept={importType === 'csv' ? '.csv' : '.txt'}
                    disabled={!importType}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!importType || !importFile}
                >
                  Importuj
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-7">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--primary-purple)', color: 'white' }}>
              <h4 className="card-title mb-0">Fiszki</h4>
              <button className="btn btn-light" onClick={handleAddFlashcard}>
                <i className="bi bi-plus-lg me-1"></i> Dodaj fiszkę
              </button>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="mb-0">Łączna liczba fiszek: <span className="badge bg-primary">{flashcards.length}</span></p>
              </div>
              
              {flashcards.length === 0 ? (
                <div className="alert alert-info">
                  Ta talia nie zawiera jeszcze żadnych fiszek. Dodaj pierwszą fiszkę lub zaimportuj fiszki z pliku.
                </div>
              ) : (
                <div className="list-group">
                  {flashcards.map(flashcard => (
                    <div key={flashcard.id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between mb-2">
                        <h5 className="mb-1" style={{ color: 'var(--primary-purple)' }}>{flashcard.term}</h5>
                        <div>
                          <button 
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => handleEditFlashcard(flashcard.id)}
                          >
                            Edytuj
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteFlashcard(flashcard.id)}
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                      <p className="mb-1">{flashcard.definition}</p>
                      {flashcard.imagePath && (
                        <div className="mt-2">
                          <small className="text-primary">Posiada obraz</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDeckEdit; 