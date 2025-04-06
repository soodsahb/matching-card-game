const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  value: { type: Number, required: true }, // 1-13 (Ace=1, Jack=11, Queen=12, King=13)
  suit: { type: String, required: true },  // hearts, diamonds, clubs, spades
  owner: { type: String, default: null },  // player who owns this card
});

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting',
  },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    connected: { type: Boolean, default: true },
    cards: [cardSchema], // Cards in player's hand
    score: { type: Number, default: 0 },
  }],
  currentTurn: {
    type: Number,
    default: 0, // Index of player whose turn it is
  },
  playedCards: [cardSchema], // Cards that have been played
  currentPile: [cardSchema], // Current pile of cards in play
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  finalTurn: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Game', gameSchema);
