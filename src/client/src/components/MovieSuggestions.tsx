import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Divider,
  CircularProgress,
  Stack
} from '@mui/material';
import { Add, Movie, Person } from '@mui/icons-material';
import { suggestionAPI, MovieSuggestion } from '../services/api';

interface MovieSuggestionsProps {
  screeningId: string;
  screeningTheme?: string;
}

const MovieSuggestions: React.FC<MovieSuggestionsProps> = ({ screeningId, screeningTheme }) => {
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screeningId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await suggestionAPI.getSuggestionsForScreening(screeningId);
      setSuggestions(response.suggestions);
    } catch (err) {
      console.error('Error loading suggestions:', err);
      setError('Failed to load suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Movie title is required.');
      return;
    }

    const parsedYear = year ? parseInt(year) : undefined;
    if (parsedYear && (parsedYear < 1900 || parsedYear > new Date().getFullYear() + 5)) {
      setError('Please enter a valid year.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await suggestionAPI.submitSuggestion(title.trim(), parsedYear, screeningId);
      
      setTitle('');
      setYear('');
      setSuccess('Movie suggestion submitted successfully!');
      
      // Reload suggestions
      await loadSuggestions();
    } catch (err: any) {
      console.error('Error submitting suggestion:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to submit suggestion. The movie might already be suggested.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const uniqueSuggestions = suggestions.reduce((acc, suggestion) => {
    const key = `${suggestion.title.toLowerCase()}-${suggestion.year || 'no-year'}`;
    if (!acc.has(key)) {
      acc.set(key, suggestion);
    }
    return acc;
  }, new Map());

  const uniqueSuggestionsArray = Array.from(uniqueSuggestions.values());

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Movie color="primary" />
        <Typography variant="h6" component="h3">
          Movie Suggestions
        </Typography>
        {screeningTheme && (
          <Chip 
            label={screeningTheme} 
            size="small" 
            variant="outlined" 
            color="secondary"
          />
        )}
      </Box>

      {/* Suggestion Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Movie Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter movie title..."
            fullWidth
            size="small"
            disabled={submitting}
            variant="outlined"
          />
          
          <TextField
            label="Year (Optional)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g., 2023"
            type="number"
            inputProps={{ min: 1900, max: new Date().getFullYear() + 5 }}
            size="small"
            sx={{ maxWidth: 200 }}
            disabled={submitting}
            variant="outlined"
          />

          <Box>
            <Button
              type="submit"
              variant="contained"
              startIcon={submitting ? <CircularProgress size={16} /> : <Add />}
              disabled={submitting || !title.trim()}
              size="small"
            >
              {submitting ? 'Submitting...' : 'Suggest Movie'}
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Suggestions List */}
      <Typography variant="subtitle1" gutterBottom>
        Community Suggestions ({uniqueSuggestionsArray.length})
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      ) : uniqueSuggestionsArray.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No suggestions yet. Be the first to suggest a movie!
        </Typography>
      ) : (
        <List dense>
          {uniqueSuggestionsArray.map((suggestion, index) => (
            <ListItem key={`${suggestion.id}-${index}`} sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" component="span">
                      {suggestion.title}
                      {suggestion.year && (
                        <Typography variant="body2" color="text.secondary" component="span">
                          {' '}({suggestion.year})
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                }
                secondary={
                  suggestion.user && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <Person fontSize="small" sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        Suggested by {suggestion.user.name}
                      </Typography>
                    </Box>
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MovieSuggestions;
