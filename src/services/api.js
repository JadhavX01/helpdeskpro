// client/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://helpdeskpro-server.onrender.com/api', // ✅ Added /api
});

// Add token to every request if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
