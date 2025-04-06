// src/socket/socketClient.js
import io from "socket.io-client";
import store from "../store/index.js";
import { 
  updateGame, 
  gameStarted, 
  gameCreated, 
  gameOver 
} from "../actions/gameActions.js";

const ENDPOINT = 'http://localhost:5000';

class SocketClient {
  constructor() {
    this.socket = null;
    this.connectPromise = null;
    this.connected = false;
  }

  connect(userId, username,gameId) {
    // If already connected or connecting, return existing promise
    if (this.connectPromise) return this.connectPromise;
    
    this.connectPromise = new Promise((resolve, reject) => {
      console.log("Connecting to socket server...");
      this.socket = io(ENDPOINT);
      this.gameId = gameId;
      
      this.socket.on('connect', () => {
        console.log('Connected to server with socket ID:', this.socket.id);
        this.connected = true;
        this.authenticate(userId, username);
        if (this.gameId) {
          console.log(`Reconnecting to game: ${this.gameId}`);
          this.socket.emit('rejoin_game', { gameId: this.gameId });
        }
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      // Set up event listeners
      this.socket.on('game_created', ({ gameId, game }) => {
        console.log('Game created:', gameId);
        store.dispatch(gameCreated(gameId, game));
      });

      this.socket.on('game_started', ({ game, gameId }) => {
        console.log('Game started with ID:', gameId);
        // Pass the gameId to the gameStarted action
        store.dispatch(gameStarted(game, gameId));
      });

      this.socket.on('game_updated', ({ game }) => {
        console.log('Game updated');
        store.dispatch(updateGame(game));
      });

      this.socket.on('game_over', ({ game }) => {
        console.log('Game over');
        store.dispatch(gameOver(game));
      });

      this.socket.on('error', ({ message }) => {
        console.error('Socket error:', message);
      });

      this.socket.on('game_rejoined', ({ game, gameId }) => {
        console.log('Successfully rejoined game:', gameId);
        
        // Important: We need to restore both the game AND gameId in state
        store.dispatch({
          type: 'REJOIN_GAME',
          payload: { game, gameId }
        });
        
        // Inform the server we're ready to accept updates
        this.socket.emit('sync_game_state', { gameId });
      });

      this.socket.on('opponent_rejoined', ({ username, gameId }) => {
        console.log(`Opponent ${username} rejoined the game`);
        // You could display a notification or update UI
      });

      
      
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.connected = false;
      });
      
      // Set a timeout in case the connection hangs
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });

    
    
    return this.connectPromise;
  }

  authenticate(userId, username) {
    if (!this.socket || !this.connected) {
      console.error('Cannot authenticate: Socket not connected');
      return;
    }
    console.log('Authenticating user:', { userId, username });
    this.socket.emit('authenticate', { userId, username });
  }

  createGame() {
    if (!this.socket || !this.connected) {
      console.error('Cannot create game: Socket not connected');
      return;
    }
    console.log('Creating game...');
    this.socket.emit('create_game');
  }

  joinGame(gameId) {
    if (!this.socket || !this.connected) {
      console.error('Cannot join game: Socket not connected');
      return;
    }
    console.log('Joining game:', gameId);
    this.socket.emit('join_game', { gameId });
  }

  playCard(gameId, cardIndex) {
    console.log("Socket status check before playing:", {
      socketExists: !!this.socket,
      connected: this.connected,
      socketId: this.socket?.id
    });
  
    if (!this.socket || !this.connected) {
      console.error('Cannot play card: Socket not connected');
      alert('Connection to server lost. Please refresh the page.');
      return;
    }
    
    console.log('Attempting to emit play_card event:', { gameId, cardIndex });
    
    try {
      this.socket.emit('play_card', { gameId, cardIndex });
      console.log('play_card event emitted successfully');
    } catch (error) {
      console.error('Error emitting play_card event:', error);
    }
  }

  rejoinGame(gameId) {
    if (!this.socket || !this.connected) {
      console.error('Cannot rejoin game: Socket not connected');
      return Promise.reject(new Error('Socket not connected'));
    }
    
    return new Promise((resolve, reject) => {
      console.log('Attempting to rejoin game:', gameId);
      
      // Set up one-time listeners for the response
      this.socket.once('game_rejoined', ({ game }) => {
        console.log('Successfully rejoined game:', gameId);
        resolve(game);
      });
      
      this.socket.once('error', ({ message }) => {
        console.error('Failed to rejoin game:', message);
        reject(new Error(message));
      });
      
      // Emit rejoin event
      this.socket.emit('rejoin_game', { gameId });
      
      // Set timeout
      setTimeout(() => {
        reject(new Error('Rejoin game timeout'));
      }, 5000);
    });}

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connectPromise = null;
    }
  }
  
  isConnected() {
    return this.connected && this.socket !== null;
  }
}

export default new SocketClient();
