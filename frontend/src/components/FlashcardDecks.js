import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FlashcardService from '../services/FlashcardService';

const FlashcardDecks = () => {
  const [myDecks, setMyDecks] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [newDeck, setNewDeck] = useState({ name: '', description: '', isPublic: false });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Ładowanie talii fiszek...');
      const myDecksResponse = await FlashcardService.getDecks();
      const publicDecksResponse = await FlashcardService.getPublicDecks();
      
      console.log('🔍 myDecksResponse:', myDecksResponse);
      console.log('🔍 publicDecksResponse:', publicDecksResponse);
      console.log('🔍 myDecksResponse.data:', myDecksResponse?.data);
      console.log('🔍 publicDecksResponse.data:', publicDecksResponse?.data);
      
      setMyDecks(myDecksResponse?.data || []);
      setPublicDecks(publicDecksResponse?.data || []);
      
      console.log('✅ Talii załadowane pomyślnie');
    } catch (err) {
      console.error('❌ Błąd podczas pobierania talii fiszek:', err);
      setError('Nie udało się pobrać talii fiszek. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setNewDeck({
      ...newDeck,
      [name]: newValue
    });
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    
    if (!newDeck.name.trim()) {
      setError('Nazwa talii jest wymagana');
      return;
    }
    
    try {
      const deckToCreate = {
        ...newDeck,
        isPublic: Boolean(newDeck.isPublic)
      };
      
      await FlashcardService.createDeck(deckToCreate);
      setNewDeck({ name: '', description: '', isPublic: false });
      setShowAddForm(false);
      await loadDecks();
    } catch (err) {
      console.error('Błąd podczas tworzenia talii:', err);
      setError('Nie udało się utworzyć talii. Spróbuj ponownie później.');
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę talię?')) {
      try {
        await FlashcardService.deleteDeck(deckId);
        loadDecks(); // Odśwież listę po usunięciu
      } catch (err) {
        setError('Nie udało się usunąć talii.');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="mt-4">
      <div className="page-header">
        <h1 className="section-title">Fiszki</h1>
        {activeTab === 'my' && (
          <button 
            className="btn btn-add-square"
            onClick={() => setShowAddForm(!showAddForm)}
            title={showAddForm ? 'Anuluj dodawanie' : 'Dodaj nową talię'}
          >
            {showAddForm ? <i className="bi bi-x-lg"></i> : <i className="bi bi-plus-lg"></i>}
          </button>
        )}
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
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            Moje talie
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => setActiveTab('public')}
          >
            Publiczne talie
          </button>
        </li>
      </ul>
      
      {showAddForm && activeTab === 'my' && (
        <div className="card mb-4">
          <div className="card-header" style={{ backgroundColor: 'var(--primary-purple)', color: 'white' }}>
            <h4 className="card-title mb-0">Nowa talia</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateDeck}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nazwa*</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={newDeck.name}
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
                  value={newDeck.description}
                  onChange={handleInputChange}
                  rows="4"
                ></textarea>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isPublic"
                  name="isPublic"
                  checked={newDeck.isPublic === true}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="isPublic">
                  Publiczna ({newDeck.isPublic ? 'Tak' : 'Nie'})
                </label>
              </div>
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setShowAddForm(false)}
                >
                  Anuluj
                </button>
                <button type="submit" className="btn btn-success">
                  Utwórz talię
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'my' && (
        <>
          {(!myDecks || !Array.isArray(myDecks) || myDecks.length === 0) ? (
            <div className="alert alert-info">
              Nie masz jeszcze żadnych talii fiszek. Utwórz swoją pierwszą talię!
            </div>
          ) : (
            <div className="row">
              {myDecks.map(deck => (
                <div className="col-lg-4 col-md-6 mb-4 d-flex align-items-stretch" key={deck.id}>
                  <div className="card deck-card h-100 w-100">
                    <div className="card-header" 
                         style={{ backgroundColor: deck.isPublic ? 'var(--light-blue)' : 'var(--light-purple)', 
                                  color: 'white' }}>
                      <h5 className="card-title mb-0">{deck.name}</h5>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <p className="card-text" style={{ flexGrow: 1 }}>{deck.description || 'Brak opisu'}</p>
                      <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                        <span className={`badge fs-6 ${deck.isPublic ? 'bg-info' : 'bg-secondary'}`}>
                          {deck.isPublic ? 'Publiczna' : 'Prywatna'}
                        </span>
                        <span className="badge bg-primary fs-6">
                          {deck.flashcards?.length || 0} fiszek
                        </span>
                      </div>
                    </div>
                    <div className="card-footer d-flex justify-content-around align-items-center">
                      <Link to={`/decks/${deck.id}`} className="btn btn-primary btn-sm deck-action-button">
                        <i className="bi bi-eye-fill me-1"></i>
                        Przeglądaj
                      </Link>
                      <Link to={`/decks/${deck.id}/anki`} className="btn btn-success btn-sm deck-action-button">
                        <i className="bi bi-layers-half me-1"></i>
                        Tryb Anki
                      </Link>
                      <div className="action-buttons">
                        <Link to={`/decks/${deck.id}/edit`} className="action-button edit fs-5" title="Edytuj">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button 
                          className="action-button delete fs-5"
                          onClick={() => handleDeleteDeck(deck.id)}
                          title="Usuń"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {activeTab === 'public' && (
        <>
          {(!publicDecks || !Array.isArray(publicDecks) || publicDecks.length === 0) ? (
            <div className="alert alert-info">Nie znaleziono publicznych talii fiszek.</div>
          ) : (
            <div className="row">
              {publicDecks.map(deck => (
                <div className="col-lg-4 col-md-6 mb-4 d-flex align-items-stretch" key={deck.id}>
                  <div className="card deck-card h-100 w-100">
                    <div className="card-header" style={{ backgroundColor: 'var(--light-blue)', color: 'white' }}>
                      <h5 className="card-title mb-0">{deck.name}</h5>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <p className="card-text" style={{ flexGrow: 1 }}>{deck.description || 'Brak opisu'}</p>
                      <div className="d-flex justify-content-end align-items-center mt-3 mb-3">
                        <span className="badge bg-primary fs-6">
                          {deck.flashcards?.length || 0} fiszek
                        </span>
                      </div>
                    </div>
                    <div className="card-footer d-flex justify-content-between align-items-center">
                      <Link to={`/decks/${deck.id}`} className="btn btn-primary btn-sm deck-action-button">
                        <i className="bi bi-eye-fill me-1"></i>
                        Przeglądaj
                      </Link>
                      <Link to={`/decks/${deck.id}/anki`} className="btn btn-success btn-sm deck-action-button">
                        <i className="bi bi-layers-half me-1"></i>
                        Tryb Anki
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashcardDecks;