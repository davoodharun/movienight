import express from 'express';
import { Database } from '../database/database';
import { ConfigManager } from '../config/configManager';
import { authenticateToken } from './auth';

export const movieRoutes = (database: Database, configManager: ConfigManager) => {
  const router = express.Router();

  // Get next screening with movies and vote counts
  router.get('/next-screening', authenticateToken, async (req, res) => {
    try {
      const nextScreeningConfig = configManager.getNextScreening();
      
      if (!nextScreeningConfig) {
        return res.json({ screening: null });
      }

      // Get votes for this screening
      const votes = await database.getVotesForScreening(nextScreeningConfig.id);
      
      // Count votes per movie
      const movieVotes: { [movieId: string]: number } = {};
      votes.forEach(vote => {
        movieVotes[vote.movieId] = (movieVotes[vote.movieId] || 0) + 1;
      });

      // Add vote counts and voter info to movies
      const moviesWithVotes = await Promise.all(
        nextScreeningConfig.movies.map(async (movie) => {
          const movieVotes = votes.filter(vote => vote.movieId === movie.id);
          const voters = await database.getVotersForMovie(movie.id, nextScreeningConfig.id);
          
          return {
            ...movie,
            votes: movieVotes.length,
            voters: voters
          };
        })
      );

      res.json({
        screening: {
          id: nextScreeningConfig.id,
          date: nextScreeningConfig.date,
          theme: nextScreeningConfig.theme,
          movies: moviesWithVotes
        }
      });
    } catch (error) {
      console.error('Error fetching next screening:', error);
      res.status(500).json({ error: 'Failed to fetch screening' });
    }
  });

  // Get specific screening by ID
  router.get('/screening/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const screeningConfig = configManager.getScreeningById(id);
      
      if (!screeningConfig) {
        return res.status(404).json({ error: 'Screening not found' });
      }

      // Get votes for this screening
      const votes = await database.getVotesForScreening(screeningConfig.id);

      // Add vote counts and voter info to movies
      const moviesWithVotes = await Promise.all(
        screeningConfig.movies.map(async (movie) => {
          const movieVotes = votes.filter(vote => vote.movieId === movie.id);
          const voters = await database.getVotersForMovie(movie.id, screeningConfig.id);
          
          return {
            ...movie,
            votes: movieVotes.length,
            voters: voters
          };
        })
      );

      res.json({
        screening: {
          id: screeningConfig.id,
          date: screeningConfig.date,
          theme: screeningConfig.theme,
          movies: moviesWithVotes
        }
      });
    } catch (error) {
      console.error('Error fetching screening:', error);
      res.status(500).json({ error: 'Failed to fetch screening' });
    }
  });

  // Get all screenings (admin only - for now just return all)
  router.get('/screenings', authenticateToken, async (req, res) => {
    try {
      const config = configManager.getConfig();
      
      // Add vote counts to each screening
      const screeningsWithVotes = await Promise.all(
        config.screenings.map(async (screeningConfig) => {
          const votes = await database.getVotesForScreening(screeningConfig.id);

          const moviesWithVotes = await Promise.all(
            screeningConfig.movies.map(async (movie) => {
              const movieVotes = votes.filter(vote => vote.movieId === movie.id);
              const voters = await database.getVotersForMovie(movie.id, screeningConfig.id);
              
              return {
                ...movie,
                votes: movieVotes.length,
                voters: voters
              };
            })
          );

          return {
            id: screeningConfig.id,
            date: screeningConfig.date,
            theme: screeningConfig.theme,
            movies: moviesWithVotes
          };
        })
      );

      res.json({ screenings: screeningsWithVotes });
    } catch (error) {
      console.error('Error fetching screenings:', error);
      res.status(500).json({ error: 'Failed to fetch screenings' });
    }
  });

  return router;
};
