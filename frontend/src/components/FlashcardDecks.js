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
      const myDecksData = await FlashcardService.getMyDecks();
      const publicDecksData = await FlashcardService.getPublicDecks();
      
      setMyDecks(myDecksData);
      setPublicDecks(publicDecksData);
    } catch (err) {
      console.error('Błąd podczas pobierania talii fiszek:', err);
      setError('Nie udało się pobrać talii fiszek. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDeck({
      ...newDeck,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    
    if (!newDeck.name.trim()) {
      setError('Nazwa talii jest wymagana');
      return;
    }
    
    try {
      await FlashcardService.createDeck(newDeck);
      setNewDeck({ name: '', description: '', isPublic: false });
      setShowAddForm(false);
      await loadDecks();
    } catch (err) {
      console.error('Błąd podczas tworzenia talii:', err);
      setError('Nie udało się utworzyć talii. Spróbuj ponownie później.');
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę talię? Ta operacja jest nieodwracalna.')) {
      try {
        await FlashcardService.deleteDeck(deckId);
        await loadDecks();
      } catch (err) {
        console.error('Błąd podczas usuwania talii:', err);
        setError('Nie udało się usunąć talii. Spróbuj ponownie później.');
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
            className="btn btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Anuluj' : 'Dodaj nową talię'}
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
          <div className="card-body">
            <h4 className="card-title">Nowa talia</h4>
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
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isPublic"
                  name="isPublic"
                  checked={newDeck.isPublic}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="isPublic">Publiczna</label>
              </div>
              <button type="submit" className="btn btn-success">Utwórz talię</button>
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'my' && (
        <>
          {myDecks.length === 0 ? (
            <div className="alert alert-info">Nie masz jeszcze żadnych talii fiszek. Utwórz swoją pierwszą talię!</div>
          ) : (
            <div className="row">
              {myDecks.map(deck => (
                <div className="col-md-4 mb-4" key={deck.id}>
                  <div className="card deck-card">
                    <div className="card-header" 
                         style={{ backgroundColor: deck.isPublic ? 'var(--light-blue)' : 'var(--light-purple)', 
                                  color: 'white' }}>
                      <h5 className="card-title mb-0">{deck.name}</h5>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{deck.description || 'Brak opisu'}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${deck.isPublic ? 'bg-info' : 'bg-secondary'}`}>
                          {deck.isPublic ? 'Publiczna' : 'Prywatna'}
                        </span>
                        <span className="badge bg-primary">
                          {deck.flashcards?.length || 0} fiszek
                        </span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="d-flex justify-content-between">
                        <Link to={`/decks/${deck.id}`} className="btn btn-primary btn-sm">
                          Przeglądaj
                        </Link>
                        <Link to={`/decks/${deck.id}/edit`} className="btn btn-secondary btn-sm">
                          Edytuj
                        </Link>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteDeck(deck.id)}
                        >
                          Usuń
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
          {publicDecks.length === 0 ? (
            <div className="alert alert-info">Nie znaleziono publicznych talii fiszek.</div>
          ) : (
            <div className="row">
              {publicDecks.map(deck => (
                <div className="col-md-4 mb-4" key={deck.id}>
                  <div className="card deck-card">
                    <div className="card-header" style={{ backgroundColor: 'var(--light-blue)', color: 'white' }}>
                      <h5 className="card-title mb-0">{deck.name}</h5>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{deck.description || 'Brak opisu'}</p>
                      <div className="text-end">
                        <span className="badge bg-primary">
                          {deck.flashcards?.length || 0} fiszek
                        </span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <Link to={`/decks/${deck.id}`} className="btn btn-primary w-100">
                        Przeglądaj
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