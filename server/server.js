import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import findFlowerRouter from './routes/findFlower.js';
import flowerMeaningRouter from './routes/flowerMeaning.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - allow all origins so the deployed frontend can reach this API
app.use(cors());

// Rate limiter - 100 requests per 15 minutes per IP (generous for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Find Your Flower API is running' });
});

// Routes
app.use('/api/find-flower', findFlowerRouter);
app.use('/api/flower-meaning', flowerMeaningRouter);

// Root route - helpful message for development
app.get('/', (req, res) => {
  res.json({
    message: 'Find Your Flower API',
    endpoints: {
      health: '/api/health',
      findFlower: 'POST /api/find-flower',
      flowerMeaning: 'POST /api/flower-meaning'
    },
    frontend: 'Access the app at http://localhost:5173 (Vite dev server)'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Find Your Flower API running on port ${PORT}`);
});
