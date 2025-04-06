// src/components/Card.js
import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  width: 100px;
  height: 140px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  cursor: pointer;
  background-image: url(${props => props.image});
  background-size: cover;
  margin: 5px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-10px);
  }
`;

const Card = ({ card, onClick, index, inPile = false }) => {
  // Generate path to card image
  const getCardImage = () => {
    // Always show card backs for cards in hand (not in pile)
    if (!inPile) return '/assets/cards/back.png';
    
    // Show card faces only for cards in the current pile
    if (!card) return '/assets/cards/back.png';
    
    const value = card.value;
    const suit = card.suit;
    
    // Map numeric values to corresponding card names
    let valueName;
    if (value === 1) {
      valueName = 'ace';
    } else if (value === 11) {
      valueName = 'jack';
    } else if (value === 12) {
      valueName = 'queen';
    } else if (value === 13) {
      valueName = 'king';
    } else {
      valueName = value; // For cards 2-10
    }

    // Handle jokers
    if (card.suit === 'joker') {
      return `/assets/cards/${card.value}_joker.png`;
    }
    
    return `/assets/cards/${valueName}_of_${suit}.png`;
  };
  
  return (
    <CardContainer 
      image={getCardImage()}
      onClick={() => onClick && onClick(index)}
    />
  );
};

export default Card;
