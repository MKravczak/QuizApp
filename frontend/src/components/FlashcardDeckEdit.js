import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FlashcardService from '../services/FlashcardService';
import '../styles/FlashcardDeckEdit.css';

const FlashcardDeckEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState({ name: '', description: '', isPublic: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [importType, setImportType] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState(null);

  useEffect(() => {
    loadDeckData();
  }, [id]);

  const loadDeckData = async () => {
    setLoading(true);
    setError(null);
    setImportError(null);
    
    try {
      const deckData = await FlashcardService.getDeckById(id);
      setDeck({
        ...deckData,
        isPublic: !!deckData.isPublic
      });
      
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
    const newValue = type === 'checkbox' ? checked : value;
    
    setDeck({
      ...deck,
      [name]: newValue
    });
    
    if (name === 'isPublic') {
      console.log('isPublic zmienione na:', newValue);
    }
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
    setImportError(null);
  };

  const handleSubmitDeckInfo = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!deck.name.trim()) {
      setError('Nazwa talii jest wymagana');
      return;
    }
    
    try {
      const updatedDeckData = {
        name: deck.name,
        description: deck.description,
        isPublic: Boolean(deck.isPublic)
      };
      
      console.log('Wysyłane dane talii:', JSON.stringify(updatedDeckData));
      
      await FlashcardService.updateDeck(id, updatedDeckData);
      alert('Informacje o talii zostały zaktualizowane.');
      await loadDeckData();
    } catch (err) {
      console.error('Błąd podczas aktualizacji informacji o talii:', err);
      setError('Nie udało się zaktualizować informacji o talii. Spróbuj ponownie później.');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setImportSuccess(false);
    setImportError(null);
    
    if (!importFile) {
      setImportError('Wybierz plik do importu.');
      return;
    }
    
    try {
      let importedData;
      if (importType === 'csv') {
        importedData = await FlashcardService.importFlashcardsFromCSV(id, importFile);
      } else if (importType === 'txt') {
        importedData = await FlashcardService.importFlashcardsFromTxt(id, importFile);
      }
      
      if (importedData) {
        setImportSuccess(true);
        setImportFile(null);
        await loadDeckData();
        setTimeout(() => setImportSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Błąd podczas importu fiszek:', err);
      setImportError(err.message || 'Nie udało się zaimportować fiszek. Sprawdź format pliku i spróbuj ponownie.');
    }
  };

  const handleAddFlashcard = () => {
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
    <div className="mt-4 flashcard-deck-edit-container">
      <div className="page-header">
        <h1 className="section-title">Edycja talii: {deck.name}</h1>
        <div>
          <Link to={`/decks/${id}`} className="btn btn-outline-secondary me-2">
            <i className="bi bi-eye-fill me-1"></i> Przeglądaj talię
          </Link>
          <Link to="/decks" className="btn btn-outline-secondary">
            <i className="bi bi-list-ul me-1"></i> Wszystkie talie
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

      <div className="row gy-4">
        <div className="col-lg-4 col-md-6">
          <div className="card h-100">
            <div className="card-header section-header">
              <h4 className="card-title mb-0"><i className="bi bi-info-circle-fill me-2"></i>Informacje o talii</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmitDeckInfo}>
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
                    rows="4"
                  ></textarea>
                </div>
                <div className="mb-3 form-check form-switch fs-5">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isPublic"
                    name="isPublic"
                    checked={deck.isPublic === true}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="isPublic">
                    Publiczna ({deck.isPublic ? 'Tak' : 'Nie'})
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-100">Zapisz informacje o talii</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card h-100">
            <div className="card-header section-header">
              <h4 className="card-title mb-0"><i className="bi bi-upload me-2"></i>Import fiszek</h4>
            </div>
            <div className="card-body">
              {importSuccess && (
                <div className="alert alert-success">
                  Fiszki zostały pomyślnie zaimportowane!
                  <button type="button" className="btn-close float-end" onClick={() => setImportSuccess(false)} aria-label="Close"></button>
                </div>
              )}
              {importError && (
                <div className="alert alert-danger">
                  {importError}
                  <button type="button" className="btn-close float-end" onClick={() => setImportError(null)} aria-label="Close"></button>
                </div>
              )}
              <form onSubmit={handleImport}>
                <div className="mb-3">
                  <label htmlFor="importType" className="form-label">Format pliku</label>
                  <select
                    className="form-select"
                    id="importType"
                    value={importType}
                    onChange={(e) => { setImportType(e.target.value); setImportError(null); }}
                    required
                  >
                    <option value="">Wybierz format...</option>
                    <option value="csv">CSV (term,definition)</option>
                    <option value="txt">TXT (term::definition)</option>
                  </select>
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
                  className="btn btn-primary w-100"
                  disabled={!importType || !importFile}
                >
                  <i className="bi bi-file-earmark-arrow-up-fill me-1"></i> Importuj wybrane fiszki
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 col-md-12">
          <div className="card h-100">
            <div className="card-header section-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0"><i className="bi bi-list-task me-2"></i>Fiszki w talii ({flashcards.length})</h4>
              <button className="btn btn-sm btn-success" onClick={handleAddFlashcard} title="Dodaj nową fiszkę">
                <i className="bi bi-plus-lg me-1"></i> Dodaj fiszkę
              </button>
            </div>
            <div className="card-body flashcard-list-edit custom-scrollbar">
              {flashcards.length === 0 ? (
                <div className="alert alert-secondary text-center mt-3">
                  Brak fiszek w tej talii.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {flashcards.map((flashcard) => (
                    <li key={flashcard.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="flashcard-text-truncate">
                        <strong title={flashcard.term}>{flashcard.term}</strong>: <span title={flashcard.definition}>{flashcard.definition}</span>
                      </div>
                      <div className="action-buttons ms-2">
                        <button
                          className="action-button edit"
                          onClick={() => handleEditFlashcard(flashcard.id)}
                          title="Edytuj fiszkę"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDeleteFlashcard(flashcard.id)}
                          title="Usuń fiszkę"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDeckEdit; 