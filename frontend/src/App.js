import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import FlashcardDecks from './components/FlashcardDecks';
import FlashcardDeckView from './components/FlashcardDeckView';
import FlashcardDeckEdit from './components/FlashcardDeckEdit';
import FlashcardForm from './components/FlashcardForm';
import NavBar from './components/NavBar';
import AuthService from './services/AuthService';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/decks" 
            element={
              <PrivateRoute>
                <FlashcardDecks />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/decks/:id" 
            element={
              <PrivateRoute>
                <FlashcardDeckView />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/decks/:id/edit" 
            element={
              <PrivateRoute>
                <FlashcardDeckEdit />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/decks/:deckId/flashcards/new" 
            element={
              <PrivateRoute>
                <FlashcardForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/decks/:deckId/flashcards/:flashcardId/edit" 
            element={
              <PrivateRoute>
                <FlashcardForm />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}

export default App; 