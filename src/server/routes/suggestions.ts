import express from 'express';
import { Database } from '../database/database';
import { authenticateToken } from './auth';

export const suggestionRoutes = (database: Database) => {
  const router = express.Router();

  // Submit a movie suggestion
  router.post('/', authenticateToken, async (req: any, res) => {
    try {
      const { title, year, screeningId } = req.body;
      const userId = req.user.userId;

      if (!title || !screeningId || !userId) {
        return res.status(400).json({ error: 'Title, screeningId, and user authentication are required' });
      }

      // Validate title length
      if (title.trim().length === 0 || title.length > 200) {
        return res.status(400).json({ error: 'Title must be between 1 and 200 characters' });
      }

      // Validate year if provided
      if (year && (year < 1900 || year > new Date().getFullYear() + 5)) {
        return res.status(400).json({ error: 'Invalid year provided' });
      }

      const suggestion = await database.createMovieSuggestion({
        screeningId,
        userId,
        title: title.trim(),
        year: year || undefined
      });

      res.json({ suggestion });
    } catch (error) {
      console.error('Error creating suggestion:', error);
      res.status(500).json({ error: 'Failed to create suggestion' });
    }
  });

  // Get suggestions for a screening
  router.get('/screening/:screeningId', authenticateToken, async (req: any, res) => {
    try {
      const { screeningId } = req.params;
      const suggestions = await database.getSuggestionsForScreening(screeningId);
      
      res.json({ suggestions });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  });

  return router;
};
