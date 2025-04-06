// routes/game.js
const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { authenticate } = require('../middleware/authMiddleware');

// Fetch game data by ID
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all games for a user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const games = await Game.find({ 'players.userId': req.params.userId });
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch user stats
router.get('/stats/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
