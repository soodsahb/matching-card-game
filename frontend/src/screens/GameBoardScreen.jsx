// src/screens/GameBoardScreen.js
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import GameBoard from '../components/GameBoard';
import styled from 'styled-components';
import { useNavigate,useParams} from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2c3e50;
  min-height: 100vh;
  color: white;
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  background-color: #34495e;
`;

const GameBoardScreen = () => {
  const { gameId } = useParams();
  const { game, status } = useSelector((state) => state.game);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If no game is loaded, redirect to lobby
    if (!game && status === 'idle') {
      navigate('/lobby');
    }
  }, [game, status, history]);

  return (
    <Container>
      <GameInfo>
        <h2>Game ID: {gameId}</h2>
        <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
      </GameInfo>
      <GameBoard />
    </Container>
  );
};

export default GameBoardScreen;
