// src/reducers/gameReducer.js
import {
  GAME_CREATED,
  GAME_STARTED,
  GAME_UPDATED,
  GAME_OVER,
  GAMES_LOADED,
  GAME_ERROR,
  REJOIN_GAME,
} from "../constants/gameConstants";

const initialState = {
  gameId: null,
  game: null,
  status: "idle", // 'idle', 'waiting', 'active', 'completed'
  winner: null,
  userGames: [],
  error: null,
};

export default function gameReducer(state = initialState, action) {
  switch (action.type) {
    case GAME_CREATED:
      return {
        ...state,
        gameId: action.payload.gameId,
        game: action.payload.game,
        status: "waiting",
        error: null,
      };

    case GAME_STARTED:
      return {
        ...state,
        game: action.payload.game,
        gameId: action.payload.gameId || state.gameId, // Keep existing gameId if new one not provided
        status: "active",
        error: null,
      };

    case GAME_UPDATED:
      return {
        ...state,
        game: action.payload,
        error: null,
      };

    case GAME_OVER:
      return {
        ...state,
        game: action.payload,
        status: "completed",
        winner: action.payload.winner,
        error: null,
      };

    case GAMES_LOADED:
      return {
        ...state,
        userGames: action.payload,
        error: null,
      };

    case GAME_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case REJOIN_GAME:
      return {
        ...state,
        gameId: action.payload.gameId,
        game: action.payload.game,
        status: action.payload.game.status,
        error: null,
      };

    default:
      return state;
  }
}
