import sqlite3 from 'sqlite3';
import path from 'path';
import { Movie, Vote, User, MovieSuggestion } from '../../shared/types';

export class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/movieschedule.db');
    this.db = new sqlite3.Database(dbPath);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Votes table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS votes (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            movie_id TEXT NOT NULL,
            screening_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, screening_id)
          )
        `);

        // Screenings table for tracking vote resets
        this.db.run(`
          CREATE TABLE IF NOT EXISTS screening_resets (
            screening_id TEXT PRIMARY KEY,
            reset_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Movie suggestions table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS movie_suggestions (
            id TEXT PRIMARY KEY,
            screening_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            year INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(screening_id, title, year)
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async createUser(user: Omit<User, 'id'> & { passwordHash: string }): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (id, username, name, password_hash) VALUES (?, ?, ?, ?)',
        [id, user.username, user.name, user.passwordHash],
        function(err) {
          if (err) reject(err);
          else resolve({ 
            id, 
            username: user.username, 
            name: user.name 
          });
        }
      );
    });
  }

  async getUserByUsername(username: string): Promise<(User & { passwordHash: string }) | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row ? {
            id: row.id,
            username: row.username,
            name: row.name,
            passwordHash: row.password_hash
          } : null);
        }
      );
    });
  }

  async createVote(vote: Omit<Vote, 'id' | 'createdAt'>): Promise<Vote> {
    const id = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO votes (id, user_id, movie_id, screening_id) VALUES (?, ?, ?, ?)',
        [id, vote.userId, vote.movieId, vote.screeningId],
        function(err) {
          if (err) reject(err);
          else resolve({ 
            id, 
            ...vote, 
            createdAt: new Date().toISOString() 
          });
        }
      );
    });
  }

  async getVotesForScreening(screeningId: string): Promise<Vote[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM votes WHERE screening_id = ?',
        [screeningId],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            movieId: row.movie_id,
            screeningId: row.screening_id,
            createdAt: row.created_at
          })));
        }
      );
    });
  }

  async getUserVoteForScreening(userId: string, screeningId: string): Promise<Vote | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM votes WHERE user_id = ? AND screening_id = ?',
        [userId, screeningId],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row ? {
            id: row.id,
            userId: row.user_id,
            movieId: row.movie_id,
            screeningId: row.screening_id,
            createdAt: row.created_at
          } : null);
        }
      );
    });
  }

  async deleteUserVoteForScreening(userId: string, screeningId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM votes WHERE user_id = ? AND screening_id = ?',
        [userId, screeningId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getVotersForMovie(movieId: string, screeningId: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT u.id, u.username, u.name 
         FROM votes v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.movie_id = ? AND v.screening_id = ?
         ORDER BY u.name`,
        [movieId, screeningId],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            id: row.id,
            username: row.username,
            name: row.name
          })));
        }
      );
    });
  }

  async resetVotesForScreening(screeningId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('DELETE FROM votes WHERE screening_id = ?', [screeningId]);
        this.db.run(
          'INSERT OR REPLACE INTO screening_resets (screening_id) VALUES (?)',
          [screeningId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });
  }

  async resetExpiredVotes(): Promise<void> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(
        'DELETE FROM votes WHERE screening_id IN (SELECT screening_id FROM screening_resets WHERE reset_at <= ?)',
        [now],
        (err) => {
          if (err) reject(err);
          else {
            console.log('Reset expired votes for past screenings');
            resolve();
          }
        }
      );
    });
  }

  async createMovieSuggestion(suggestion: Omit<MovieSuggestion, 'id' | 'createdAt'>): Promise<MovieSuggestion> {
    const id = `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO movie_suggestions (id, screening_id, user_id, title, year) VALUES (?, ?, ?, ?, ?)',
        [id, suggestion.screeningId, suggestion.userId, suggestion.title, suggestion.year || null],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            // Suggestion already exists, return existing one
            resolve({
              id: 'existing',
              screeningId: suggestion.screeningId,
              userId: suggestion.userId,
              title: suggestion.title,
              year: suggestion.year,
              createdAt: new Date().toISOString()
            });
          } else {
            resolve({ 
              id, 
              ...suggestion, 
              createdAt: new Date().toISOString() 
            });
          }
        }
      );
    });
  }

  async getSuggestionsForScreening(screeningId: string): Promise<MovieSuggestion[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT ms.*, u.username, u.name 
         FROM movie_suggestions ms 
         JOIN users u ON ms.user_id = u.id 
         WHERE ms.screening_id = ? 
         ORDER BY ms.created_at DESC`,
        [screeningId],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            id: row.id,
            screeningId: row.screening_id,
            userId: row.user_id,
            title: row.title,
            year: row.year,
            createdAt: row.created_at,
            user: {
              id: row.user_id,
              username: row.username,
              name: row.name
            }
          })));
        }
      );
    });
  }

  close(): void {
    this.db.close();
  }
}
