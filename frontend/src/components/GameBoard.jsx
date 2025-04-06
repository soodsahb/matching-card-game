// src/components/GameBoard.js
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import Card from './Card';
import socketClient from '../socket/socketClient';
import { useNavigate,useParams} from 'react-router-dom';
import { toast } from 'react-toastify';


const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #2c3e50;
  min-height: 100vh;
  color: white;
`;

const PlayerHand = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
  max-width: 800px;
`;

const GamePile = styled.div`
  position: relative;
  margin: 30px auto;
  min-height: 150px;
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// New component for stacking cards
const PileCardWrapper = styled.div`
  position: absolute;
  top: ${props => props.index * 5}px;
  left: ${props => props.index * 5}px;
  z-index: ${props => props.index + 1};
`;



const GameInfo = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const PileMessage = styled.div`
  color: white;
  text-align: center;
  padding: 30px;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
`;

const GameBoard = () => {
  const { game, gameId, status } = useSelector((state) => state.game);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const lastPileWinnerRef = useRef(null);
  const [lastPileWinner, setLastPileWinner] = useState(null);
  const prevPileLength = useRef(0);
  const prevStatus = useRef(null);


  useEffect(() => {
    // Only run when status changes to 'completed'
    if (status === 'completed' && prevStatus.current !== 'completed' && game) {
      // Show the appropriate toast message
      if (game.winner === null) {
        toast.info("Game ended in a tie!", { 
          icon: "🤝"
        });
      } else if (game.winner === user._id) {
        toast.success("Congratulations! You won the game!", {
          icon: "🏆"
        });
      } else {
        toast.info("You lost this round. Better luck next time!", {
          icon: "👍"
        });
      }
      
      // Redirect to lobby after 3 seconds
      const redirectTimer = setTimeout(() => {
        navigate('/lobby');
      }, 3000);
      
      // Clear the timer if component unmounts
      return () => clearTimeout(redirectTimer);
    }
    
    prevStatus.current = status;
  }, [status, game, user._id, navigate]);

  // Track who won the last pile
  useEffect(() => {
    if (!game) return;
    
    // If pile was just cleared (previously had cards, now empty)
    if (prevPileLength.current > 0 && game.currentPile.length === 0) {
      const winnerIndex = game.currentTurn === 0 ? 1 : 0; // Toggle from current turn
      const winnerName = game.players[winnerIndex].userId === user._id ? 'You' : game.players[winnerIndex].username;
      setLastPileWinner(winnerName);
      lastPileWinnerRef.current = winnerName;
    }
    
    prevPileLength.current = game.currentPile.length;
  }, [game?.currentPile?.length, game?.currentTurn, user._id]);

  useEffect(() => {
    if (gameId && gameId !== 'null') {
      localStorage.setItem('currentGameId', gameId);
    }
  }, [gameId]);
  
  // Redirect if we have 'null' gameId but a stored one exists
  useEffect(() => {
    if (gameId === 'null' && localStorage.getItem('currentGameId')) {
      navigate(`/game/${localStorage.getItem('currentGameId')}`);
    }
  }, [gameId, navigate]);

  const isSameId = (id1, id2) => {
    if (!id1 || !id2) return false;
    return id1.toString() === id2.toString();
  };
  
  const playCard = (cardIndex) => {
    if (!game || status !== 'active') {
      console.log("Game not active, can't play card");
      return;
    }
    
    // Determine the current player's index
    const playerIndex = game.players.findIndex(p => isSameId(p.userId, user._id));
    
    if (playerIndex === -1) {
      console.error("Player not found in game", { 
        userId: user?._id, 
        players: game.players.map(p => p.userId) 
      });
      return;
    }
    
    // Use the gameId from URL params if Redux state has null
    const actualGameId = gameId === 'null' ? 
      localStorage.getItem('currentGameId') || game.gameId : 
      gameId;
    
    console.log("Card click info:", { 
      turn: game.currentTurn,
      playerIndex,
      isYourTurn: game.currentTurn === playerIndex,
      gameId: actualGameId
    });
    
    if (game.currentTurn === playerIndex) {
      if (cardIndex >= 0 && cardIndex < game.players[playerIndex].cards.length) {
        // Add debugging to see if this is called
        console.log("Sending play_card for card:", cardIndex);
        socketClient.playCard(actualGameId, cardIndex);
      } else {
        alert("Invalid card selection!");
      }
    } else {
      alert("Not your turn!");
    }
  };

  if (!game) {
    return <div>Loading game...</div>;
  }

  const playerIndex = game.players.findIndex(p => p.userId === user._id);
  const player = game.players[playerIndex];
  const opponent = game.players.find(p => p.userId !== user._id);

  return (
    <GameContainer>
      <GameInfo>
        <h2>Game Status: {status}</h2>
        <h3>Your Score: {player?.score || 0}</h3>
        <h3>Opponent Score: {opponent?.score || 0}</h3>
        {status === 'active' && (
  <h3>
    Turn: {game.currentTurn === playerIndex ? 'Your Turn' : 'Opponent\'s Turn'}
    {game.finalTurn && <span style={{color: '#e74c3c'}}> (Final Turn!)</span>}
  </h3>
)}
        {status === 'completed' && (
  <h2>
    {game.winner === null 
      ? 'Game Tied!' 
      : game.winner === user._id 
        ? 'You Win!' 
        : 'Opponent Wins!'
        
        
        }
  </h2>
)}
      </GameInfo>

      {/* Opponent's hand (show card backs) */}
      <div>
        <h3>Opponent's Cards</h3>
        <PlayerHand>
          {opponent && Array.from({ length: opponent.cards.length }).map((_, index) => (
            <Card key={`opponent-${index}`} card={null} />
          ))}
        </PlayerHand>
      </div>

      {/* Game pile (current pile of played cards) */}
      <GamePile>
        {game.currentPile.length === 0 ? (
          <PileMessage>
            {game.playedCards.length > 0 
              ? `Last pile was won by ${lastPileWinner || 'a player'}!` 
              : 'No cards played yet'}
          </PileMessage>
        ) : (
          game.currentPile.map((card, index) => (
            <PileCardWrapper key={`pile-${index}`} index={index}>
              <Card 
                card={card}
                inPile={true}
              />
            </PileCardWrapper>
          ))
        )}
      </GamePile>

      {/* Player's hand */}
      <div>
  <h3>Your Cards</h3>
  <PlayerHand>
    {player && player.cards.map((card, index) => (
      <Card 
        key={`player-${index}`} 
        card={card} 
        index={index}
        onClick={playCard}
        inPile={false} // Not necessary as default is false, but for clarity
      />
    ))}
  </PlayerHand>
</div>
    </GameContainer>
  );
};

export default GameBoard;
