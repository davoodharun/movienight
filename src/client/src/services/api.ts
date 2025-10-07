import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

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

interface User {
  id: string;
  username: string;
  name: string;
}

export interface MovieScreening {
  id: string;
  date: string;
  movies: Movie[];
}

export interface Vote {
  id: string;
  userId: string;
  movieId: string;
  screeningId: string;
  createdAt: string;
}

export const authAPI = {
  register: async (username: string, name: string, password: string) => {
    const response = await api.post('/auth/register', { username, name, password });
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

export const movieAPI = {
  getNextScreening: async (): Promise<{ screening: MovieScreening | null }> => {
    const response = await api.get('/movies/next-screening');
    return response.data;
  },
  
  getAllScreenings: async (): Promise<{ screenings: MovieScreening[] }> => {
    const response = await api.get('/movies/screenings');
    return response.data;
  },
};

export const voteAPI = {
  castVote: async (movieId: string, screeningId: string): Promise<{ vote: Vote }> => {
    const response = await api.post('/votes', { movieId, screeningId });
    return response.data;
  },
  
  cancelVote: async (screeningId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/votes/${screeningId}`);
    return response.data;
  },
  
  getMyVote: async (screeningId: string): Promise<{ vote: Vote | null }> => {
    const response = await api.get(`/votes/my-vote/${screeningId}`);
    return response.data;
  },

  clearAllVotes: async (screeningId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/votes/admin/clear/${screeningId}`);
    return response.data;
  },
};
