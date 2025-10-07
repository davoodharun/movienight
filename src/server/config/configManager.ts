import fs from 'fs';
import path from 'path';
import { Config, MovieScreening, ConfigScreening } from '../../shared/types';

export class ConfigManager {
  private configPath: string;
  private config: Config = { screenings: [] };

  constructor() {
    this.configPath = process.env.CONFIG_PATH || path.join(__dirname, '../../../data/config.json');
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
        console.log('✅ Loaded config from:', this.configPath);
      } else {
        // Try to copy config from the repository first
        const repoConfigPath = path.join(__dirname, '../../../src/data/config.json');
        if (fs.existsSync(repoConfigPath)) {
          console.log('📋 Copying config from repository to data directory...');
          const configData = fs.readFileSync(repoConfigPath, 'utf8');
          this.config = JSON.parse(configData);
          this.saveConfig();
          console.log('✅ Config copied and saved to:', this.configPath);
        } else {
          // Create default config as fallback
          console.log('⚠️  No config found, creating default config');
          this.config = this.getDefaultConfig();
          this.saveConfig();
        }
      }
    } catch (error) {
      console.error('❌ Error loading config:', error);
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): Config {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const weekAfter = new Date();
    weekAfter.setDate(weekAfter.getDate() + 14);

    return {
      screenings: [
        {
          id: 'screening_1',
          date: nextWeek.toISOString(),
          movies: [
            { id: 'movie_1', title: 'The Matrix', year: 1999 },
            { id: 'movie_2', title: 'Inception', year: 2010 },
            { id: 'movie_3', title: 'Interstellar', year: 2014 },
            { id: 'movie_4', title: 'Blade Runner 2049', year: 2017 }
          ]
        },
        {
          id: 'screening_2',
          date: weekAfter.toISOString(),
          movies: [
            { id: 'movie_5', title: 'The Dark Knight', year: 2008 },
            { id: 'movie_6', title: 'Pulp Fiction', year: 1994 },
            { id: 'movie_7', title: 'The Godfather', year: 1972 },
            { id: 'movie_8', title: 'Goodfellas', year: 1990 }
          ]
        }
      ]
    };
  }

  private saveConfig(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  getConfig(): Config {
    return this.config;
  }

  getNextScreening(): ConfigScreening | null {
    const now = new Date();
    const upcomingScreenings = this.config.screenings
      .filter(screening => new Date(screening.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return upcomingScreenings.length > 0 ? upcomingScreenings[0] : null;
  }

  getScreeningById(id: string): ConfigScreening | null {
    return this.config.screenings.find(screening => screening.id === id) || null;
  }

  updateConfig(newConfig: Config): void {
    this.config = newConfig;
    this.saveConfig();
  }

  getExpiredScreenings(): ConfigScreening[] {
    const now = new Date();
    return this.config.screenings.filter(screening => new Date(screening.date) <= now);
  }
}
