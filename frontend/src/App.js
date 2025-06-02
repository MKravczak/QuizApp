import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import FlashcardDecks from './components/FlashcardDecks';
import FlashcardDeckView from './components/FlashcardDeckView';
import FlashcardDeckEdit from './components/FlashcardDeckEdit';
import FlashcardForm from './components/FlashcardForm';
import FlashcardAnkiMode from './components/FlashcardAnkiMode';
import QuizList from './components/QuizList';
import QuizCreate from './components/QuizCreate';
import QuizPlay from './components/QuizPlay';
import QuizResults from './components/QuizResults';
import QuizStatistics from './components/QuizStatistics';
import QuizStatisticsList from './components/QuizStatisticsList';
import GroupManagement from './components/groups/GroupManagement';
import NavBar from './components/NavBar';
import AuthService from './services/AuthService';
import './styles/global.css';

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
            path="/groups" 
            element={
              <PrivateRoute>
                <GroupManagement />
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
            path="/decks/:id/anki" 
            element={
              <PrivateRoute>
                <FlashcardAnkiMode />
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
          <Route 
            path="/quizzes" 
            element={
              <PrivateRoute>
                <QuizList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quizzes/create" 
            element={
              <PrivateRoute>
                <QuizCreate />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quizzes/:quizId/play" 
            element={
              <PrivateRoute>
                <QuizPlay />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quizzes/:quizId/results" 
            element={
              <PrivateRoute>
                <QuizResults />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quizzes/statistics" 
            element={
              <PrivateRoute>
                <QuizStatisticsList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quizzes/:quizId/statistics" 
            element={
              <PrivateRoute>
                <QuizStatistics />
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