require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('./config/database');

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// ─── BODY PARSERS ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC UPLOADS ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ─────────────────────────────────────────────────────────────────
const apiRoutes = require('./routes/api');
app.use('/api/v1', apiRoutes);

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Sohani Dairy Farm API is running 🐄', version: '1.0.0' });
});

// ─── 404 HANDLER ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Sohani Dairy API running at http://localhost:${PORT}`);
});

module.exports = app;
