// services/gameService.js
const Game = require('../models/Game');
const User = require('../models/User');

class GameService {
  // Create a new card deck with 52 cards
  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = Array.from({ length: 13 }, (_, i) => i + 1); // 1-13
    
    const deck = [];
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }

     // Add jokers if needed
     deck.push({ suit: 'joker', value: 14 }); // Black joker
     deck.push({ suit: 'joker', value: 15 }); // Red joker
    
    return this.shuffleDeck(deck);
  }

  // Shuffle the deck using Fisher-Yates algorithm
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Create a new game
  async createGame(gameId, userId, username) {
    const game = new Game({
      gameId,
      players: [{
        userId,
        username,
        cards: [],
        score: 0,
      }],
      currentPile: [],
    });
    
    await game.save();
    return game;
  }

  // Join an existing game
  async joinGame(gameId, userId, username) {
    const game = await Game.findOne({ gameId });
    if (!game) throw new Error('Game not found');
    
    if (game.players.length >= 2) throw new Error('Game is full');
    
    game.players.push({
      userId,
      username,
      cards: [],
      score: 0,
    });
    
    await game.save();
    return game;
  }

  // Start the game and deal cards
  async startGame(gameId) {
    const game = await Game.findOne({ gameId });
    if (!game) throw new Error('Game not found');
    
    // Create and shuffle deck
    const deck = this.createDeck();
    
    // Deal cards to players (26 each)
    game.players[0].cards = deck.slice(0, 26);
    game.players[1].cards = deck.slice(26);
    game.status = 'active';
    
    await game.save();
    return game;
  }

  // Play a card
  async playCard(gameId, userId, cardIndex) {
    const game = await Game.findOne({ gameId });
    if (!game) throw new Error('Game not found');
    
    const playerIndex = game.players.findIndex(p => p.userId.toString() === userId);
  if (playerIndex === -1) throw new Error('Player not found in this game');

  if (cardIndex < 0 || cardIndex >= game.players[playerIndex].cards.length) {
    throw new Error('Invalid card index');
  }
    
    // Get the card to play
    const card = game.players[playerIndex].cards[cardIndex];

    if (!card) throw new Error('Card not found at the specified index');
    if (!card || !card.suit || !card.value) {
      throw new Error('Invalid card: missing suit or value');
    }
    
    // Remove card from player's hand
    game.players[playerIndex].cards.splice(cardIndex, 1);
    
    // Add card to the current pile with owner info
    game.currentPile.push({
      suit: card.suit,
      value: card.value,
      owner: userId
    });

    let justWonPile = false;
    
    // Check if card matches previous card
    if (game.currentPile.length > 1) {
      const topCard = game.currentPile[game.currentPile.length - 1];
      const previousCard = game.currentPile[game.currentPile.length - 2];
      
      if (topCard.value === previousCard.value || 
        (topCard.suit === 'joker' && previousCard.suit === 'joker')) {
      // Player wins the pile
      const winningPlayer = game.players[playerIndex];
      winningPlayer.score += game.currentPile.length;
      
      // Add pile to played cards and clear current pile
      game.playedCards.push(...game.currentPile);
      game.currentPile = [];
      justWonPile = true;
    }
    }

    let gameEnding = false;
    
  
  // Case 1: This was already marked as a final turn
  if (game.finalTurn) {
    gameEnding = true;
  }
  // Case 2: Both players are now out of cards
  else if (game.players[0].cards.length === 0 && game.players[1].cards.length === 0) {
    gameEnding = true;
  }   // Case 3: This player is out of cards AND just won the pile (nothing left to win)
  else if (game.players[playerIndex].cards.length === 0 && justWonPile) {
    gameEnding = true;
  }
  // Case 4: Only this player is out of cards - set final turn
  else if (game.players[playerIndex].cards.length === 0) {
    game.finalTurn = true;
  }
    
    // Switch turns (unless the other player also has no cards)
  const otherPlayerIndex = (playerIndex + 1) % 2;
  if (!gameEnding && game.players[otherPlayerIndex].cards.length > 0) {
    game.currentTurn = otherPlayerIndex;
  }
    
    // Check if game is over
  if (gameEnding) {
    game.status = 'completed';
    
    // Determine winner based on score
    if (game.players[0].score > game.players[1].score) {
      game.winner = game.players[0].userId;
    } else if (game.players[1].score > game.players[0].score) {
      game.winner = game.players[1].userId;
    } else {
      // It's a tie
      game.winner = null;
    }
    
    // Update player stats
    for (const player of game.players) {
      await User.findByIdAndUpdate(player.userId, {
        $inc: {
          'stats.gamesPlayed': 1,
          'stats.gamesWon': player.userId.toString() === game.winner?.toString() ? 1 : 0,
        }
      });
    }
  }
    
    await game.save();
    return game;
  }

  async getGame(gameId) {
    const game = await Game.findOne({ gameId });
    if (!game) throw new Error('Game not found');
    return game;
  }
}

module.exports = GameService;
