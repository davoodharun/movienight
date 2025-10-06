import express from 'express';
import { Database } from '../database/database';
import { ConfigManager } from '../config/configManager';
import { authenticateToken } from './auth';

export const voteRoutes = (database: Database, configManager: ConfigManager) => {
  const router = express.Router();

  // Cast a vote
  router.post('/', authenticateToken, async (req: any, res) => {
    try {
      const { movieId, screeningId } = req.body;
      const userId = req.user.userId;

      if (!movieId || !screeningId) {
        return res.status(400).json({ error: 'Movie ID and screening ID are required' });
      }

      // Verify the screening exists and is in the future
      const screening = configManager.getScreeningById(screeningId);
      if (!screening) {
        return res.status(404).json({ error: 'Screening not found' });
      }

      const screeningDate = new Date(screening.date);
      const now = new Date();
      
      if (screeningDate <= now) {
        return res.status(400).json({ error: 'Voting is closed for this screening' });
      }

      // Verify the movie exists in this screening
      const movie = screening.movies.find(m => m.id === movieId);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found in this screening' });
      }

      // Create or update vote
      const vote = await database.createVote({
        userId,
        movieId,
        screeningId
      });

      res.json({ vote });
    } catch (error) {
      console.error('Error casting vote:', error);
      res.status(500).json({ error: 'Failed to cast vote' });
    }
  });

  // Get user's vote for a screening
  router.get('/my-vote/:screeningId', authenticateToken, async (req: any, res) => {
    try {
      const { screeningId } = req.params;
      const userId = req.user.userId;

      const vote = await database.getUserVoteForScreening(userId, screeningId);
      
      res.json({ vote });
    } catch (error) {
      console.error('Error fetching user vote:', error);
      res.status(500).json({ error: 'Failed to fetch vote' });
    }
  });

  // Admin: Clear all votes for a screening
  router.delete('/admin/clear/:screeningId', authenticateToken, async (req: any, res) => {
    try {
      const { screeningId } = req.params;

      // Verify the screening exists
      const screening = configManager.getScreeningById(screeningId);
      if (!screening) {
        return res.status(404).json({ error: 'Screening not found' });
      }

      // Clear all votes for this screening
      await database.resetVotesForScreening(screeningId);

      res.json({ message: `All votes cleared for screening ${screeningId}` });
    } catch (error) {
      console.error('Error clearing votes:', error);
      res.status(500).json({ error: 'Failed to clear votes' });
    }
  });

  return router;
};
