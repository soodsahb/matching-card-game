// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Game APIs
export const fetchGame = async (gameId) => {
  const response = await axios.get(`${API_URL}/games/${gameId}`);
  return response.data;
};

export const fetchUserGames = async (userId) => {
  const response = await axios.get(`${API_URL}/games/user/${userId}`);
  return response.data;
};

export const fetchUserStats = async (userId) => {
  const response = await axios.get(`${API_URL}/games/stats/${userId}`);
  return response.data;
};

// Auth APIs are handled in authActions.js
