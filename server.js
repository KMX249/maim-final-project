import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import ticketsRoutes from './routes/tickets.js';
import checkinRoutes from './routes/checkin.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/healthz', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventx', {})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log('API listening on', PORT));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });