// Let's enhance the gameActions.js to include asynchronous actions
import {
    GAME_CREATED,
    GAME_STARTED,
    GAME_UPDATED,
    GAME_OVER,
    GAMES_LOADED,
    GAME_ERROR
  } from '../constants/gameConstants';
  import { fetchGame, fetchUserGames } from '../services/api';
  
  // These actions will be dispatched by Socket.io events
  export const gameCreated = (gameId, game) => ({
    type: GAME_CREATED,
    payload: { gameId, game }
  });
  
  export const gameStarted = (game, gameId) => ({
    type: GAME_STARTED,
    payload: { game, gameId }
  });
  
  export const updateGame = (game) => {
    console.log("Updating game state:", game);
    return {
      type: GAME_UPDATED,
      payload: game
    };
  };
  
  export const gameOver = (game) => ({
    type: GAME_OVER,
    payload: game
  });
  
  // Additional async actions that can be called directly
  export const loadGame = (gameId) => async (dispatch) => {
    try {
      const game = await fetchGame(gameId);
      dispatch({
        type: GAME_UPDATED,
        payload: game
      });
    } catch (error) {
      dispatch({
        type: GAME_ERROR,
        payload: error.message
      });
    }
  };
  
  export const loadUserGames = (userId) => async (dispatch) => {
    try {
      const games = await fetchUserGames(userId);
      dispatch({
        type: GAMES_LOADED,
        payload: games
      });
    } catch (error) {
      dispatch({
        type: GAME_ERROR,
        payload: error.message
      });
    }
  };
  