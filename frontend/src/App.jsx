// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import GameLobbyScreen from './screens/GameLobbyScreen';
import GameBoardScreen from './screens/GameBoardScreen';
import socketClient from './socket/socketClient';
import { Navigate } from 'react-router-dom';
import { loadUser } from './actions/authActions';

const App = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Load user on app start
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    // Check if user was in a game before
    const savedGameId = localStorage.getItem('currentGameId');
    
    // Connect to socket.io when user is authenticated
    if (isAuthenticated && user) {
      // Connect with the saved gameId (if any)
      socketClient.connect(user._id, user.username, savedGameId)
        .then(() => {
          if (savedGameId) {
            console.log(`Trying to rejoin previous game: ${savedGameId}`);
            socketClient.rejoinGame(savedGameId)
              .catch(err => {
                console.log('Could not rejoin previous game:', err.message);
                // Clear saved game if it's no longer valid
                localStorage.removeItem('currentGameId');
              });
          }
        })
        .catch(err => console.error('Socket connection failed:', err));
    }
    
    // Disconnect when component unmounts
    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, user]);
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
  <Route 
    path="/login" 
    element={isAuthenticated ? <Navigate to="/lobby" /> : <LoginScreen />} 
  />
  <Route 
    path="/register" 
    element={isAuthenticated ? <Navigate to="/lobby" /> : <RegisterScreen />} 
  />
  <Route 
    path="/lobby" 
    element={isAuthenticated ? <GameLobbyScreen /> : <Navigate to="/login" />} 
  />
  <Route 
    path="/game/:gameId" 
    element={isAuthenticated ? <GameBoardScreen /> : <Navigate to="/login" />} 
  />
  <Route path="/" element={<Navigate to="/lobby" />} />
</Routes>
    </Router>
  );
};

export default App;
