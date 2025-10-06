export interface MovieMetadata {
  tmdb_id: number | null;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: string[];
  release_date: string | null;
  tagline: string | null;
  imdb_id: string | null;
  budget: number | null;
  revenue: number | null;
  fetched_at: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  votes: number;
  voters: User[];
  metadata?: MovieMetadata;
}

export interface ConfigMovie {
  id: string;
  title: string;
  year: number;
  metadata?: MovieMetadata;
}

export interface MovieScreening {
  id: string;
  date: string; // ISO date string
  movies: Movie[];
}

export interface ConfigScreening {
  id: string;
  date: string;
  movies: ConfigMovie[];
}

export interface User {
  id: string;
  username: string;
  name: string;
}

export interface Vote {
  id: string;
  userId: string;
  movieId: string;
  screeningId: string;
  createdAt: string;
}

export interface Config {
  screenings: ConfigScreening[];
}
