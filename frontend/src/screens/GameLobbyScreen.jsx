// src/screens/GameLobbyScreen.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import socketClient from '../socket/socketClient';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background-color: #2c3e50;
  min-height: 100vh;
  color: white;
`;

const Card = styled.div`
  background-color: #34495e;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  width: 400px;
  text-align: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const Input = styled.input`
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  border: none;
  width: 100%;
`;

const GameLobbyScreen = () => {
  const [gameId, setGameId] = useState('');
  const { user } = useSelector((state) => state.auth);
  const { gameId: currentGameId, status } = useSelector((state) => state.game);
  const navigate = useNavigate();

  // If game has started, redirect to game screen
  useEffect(() => {
    if (status === 'active' || status === 'waiting') {
      navigate(`/game/${currentGameId}`);
    }
  }, [status, currentGameId, navigate]);

  const handleCreateGame = () => {
    socketClient.createGame();
  };

  const handleJoinGame = async () => {
    if (!gameId) return;
    
    try {
      // First try to rejoin (in case player was already in this game)
      await socketClient.rejoinGame(gameId);
    } catch (error) {
      // If rejoin fails (player wasn't in this game), try joining normally
      console.log("Couldn't rejoin, trying to join as new player");
      socketClient.joinGame(gameId);
    }
  };

  return (
    <Container>
      <h1>Card Game Lobby</h1>

      <Card>
  <h2>Game Rules</h2>
  <p>
    • Players take turns playing cards<br/>
    • Cards are face-down - you won't see what you play!<br/>
    • When your card matches the previous card's value, you win the pile!<br/>
    • Jokers are special: A joker on joker wins the game<br/>
    • The player with the highest score when all cards are played wins
  </p>
</Card>
      
      <Card>
        <h2>Create New Game</h2>
        <p>Start a new game and invite a friend to join</p>
        <Button onClick={handleCreateGame}>Create Game</Button>
      </Card>
      
      <Card>
        <h2>Join Game</h2>
        <p>Enter a game ID to join an existing game</p>
        <Input
          type="text"
          placeholder="Enter Game ID"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
        <Button onClick={handleJoinGame}>Join Game</Button>
      </Card>
    </Container>
  );
};

export default GameLobbyScreen;
