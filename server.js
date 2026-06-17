const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.cloudmoonapp.com';

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API proxy endpoints
const axios = require('axios');

// Auth routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, serverId } = req.body;
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
      serverId
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Login failed'
    });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, serverId } = req.body;
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
      email,
      password,
      serverId
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Signup failed'
    });
  }
});

// Games API
app.get('/api/games', async (req, res) => {
  try {
    const { category, search } = req.query;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await axios.get(`${API_BASE_URL}/games?${params}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch games'
    });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Game not found'
    });
  }
});

// Game instance
app.post('/api/games/:id/start', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.post(`${API_BASE_URL}/games/${req.params.id}/start`, {
      token
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to start game'
    });
  }
});

app.post('/api/games/:id/stop', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.post(`${API_BASE_URL}/games/${req.params.id}/stop`, {
      token
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to stop game'
    });
  }
});

// User profile
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const response = await axios.get(`${API_BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch profile'
    });
  }
});

// Servers list
app.get('/api/servers', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/servers`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch servers'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Dynamic routes for public HTML files (based on filename)
app.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      // If file not found, serve index.html as fallback
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🌙 CloudMoon Web Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
