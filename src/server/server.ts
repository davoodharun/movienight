import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { authRoutes } from './routes/auth';
import { movieRoutes } from './routes/movies';
import { voteRoutes } from './routes/votes';
import { Database } from './database/database';
import { ConfigManager } from './config/configManager';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database and config
const database = new Database();
const configManager = new ConfigManager();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://image.tmdb.org"], // Allow TMDb images
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes(database, configManager));
app.use('/api/votes', voteRoutes(database, configManager));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Schedule vote reset after each screening
cron.schedule('0 0 * * *', async () => {
  console.log('Checking for expired screenings...');
  await database.resetExpiredVotes();
});

// Initialize database on startup
database.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

export default app;
