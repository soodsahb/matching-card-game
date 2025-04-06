// src/store/index.js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk'; // Changed this line
import gameReducer from '../reducers/gameReducer';
import authReducer from '../reducers/authReducer';

const rootReducer = combineReducers({
  game: gameReducer,
  auth: authReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;

