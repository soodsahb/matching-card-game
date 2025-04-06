
const { v4: uuidv4 } = require('uuid');
const GameService = require('../services/gameService');
const gameService = new GameService();
const Game= require('../models/Game')

module.exports = function(io) {
  // Track active games and connected users
  const activeGames = new Map();
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // User authentication
    socket.on('authenticate', ({ userId, username }) => {
      connectedUsers.set(userId, {
        socketId: socket.id,
        username,
      });
      
      socket.userId = userId;
      socket.username = username;
    });

    // Create a new game
    socket.on('create_game', async () => {
      try {
        const gameId = uuidv4();
        const game = await gameService.createGame(gameId, socket.userId, socket.username);
        
        socket.join(gameId);
        activeGames.set(gameId, game);
        
        socket.emit('game_created', { gameId, game });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('sync_game_state', async ({ gameId }) => {
      try {
        // Get the latest game state
        const game = await gameService.getGame(gameId);
        if (!game) {
          return socket.emit('error', { message: 'Game not found' });
        }
        
        // Send the most current state
        socket.emit('game_updated', { 
          game,
          gameId
        });
        
        console.log(`Synced game state for ${socket.userId} in game ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Join an existing game
    socket.on('join_game', async ({ gameId }) => {
      try {
        let game = activeGames.get(gameId) || await gameService.getGame(gameId);
        
        game = await gameService.joinGame(gameId, socket.userId, socket.username);
        socket.join(gameId);
        
        // If we now have 2 players, start the game
        if (game.players.length === 2) {
          game = await gameService.startGame(gameId);
          // Fix: Include gameId in the game_started event
          io.to(gameId).emit('game_started', { game, gameId });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Play a card
    socket.on('play_card', async ({ gameId, cardIndex }) => {
  try {
    console.log(`Player ${socket.userId} playing card in game ${gameId}`);
    
    const game = await gameService.playCard(gameId, socket.userId, cardIndex);
    
    // Make sure to explicitly include gameId in every game update
    io.to(gameId).emit('game_updated', { 
      game,
      gameId  // Explicitly include gameId here
    });
    
    if (game.status === 'completed') {
      io.to(gameId).emit('game_over', { game, gameId });
    }
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
});

// In your server socketHandler.js
socket.on('rejoin_game', async ({ gameId }) => {
  try {
    // Find the game
    const game = await gameService.getGame(gameId);
    
    if (!game) {
      return socket.emit('error', { message: 'Game not found' });
    }
    
    // Check if player is already in this game
    const playerIndex = game.players.findIndex(p => 
      p.userId.toString() === socket.userId
    );
    
    if (playerIndex === -1) {
      return socket.emit('error', { message: 'You are not a player in this game' });
    }
    
    // Mark player as reconnected
    game.players[playerIndex].connected = true;
    await game.save();
    
    // Join the socket room
    socket.join(gameId);
    
    // Send the current game state
    socket.emit('game_rejoined', { game, gameId });
    
    // Notify other player
    socket.broadcast.to(gameId).emit('opponent_rejoined', {
      username: socket.username,
      gameId
    });
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
});

    // Handle disconnection
   // In your server socketHandler.js
socket.on('disconnect', async () => {
  if (socket.userId) {
    connectedUsers.delete(socket.userId);
    
    // Find games this player is in
    try {
      const games = await Game.find({ 'players.userId': socket.userId, status: 'active' });
      
      for (const game of games) {
        // Mark player as disconnected but don't remove them
        const playerIndex = game.players.findIndex(p => 
          p.userId.toString() === socket.userId
        );
        
        if (playerIndex !== -1) {
          game.players[playerIndex].connected = false;
          await game.save();
          
          // Notify other player
          socket.broadcast.to(game.gameId).emit('opponent_disconnected', {
            username: socket.username
          });
        }
      }
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  }
});

  });
};
