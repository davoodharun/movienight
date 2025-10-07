import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AccountCircle, Movie, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { movieAPI, voteAPI, MovieScreening } from '../services/api';
import MovieCard from './MovieCard';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [nextScreening, setNextScreening] = useState<MovieScreening | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const screeningData = await movieAPI.getNextScreening();
      setNextScreening(screeningData.screening);
      
      if (screeningData.screening) {
        const voteData = await voteAPI.getMyVote(screeningData.screening.id);
        setUserVote(voteData.vote?.movieId || null);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load movie data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (movieId: string) => {
    if (!nextScreening) return;
    
    try {
      await voteAPI.castVote(movieId, nextScreening.id);
      setUserVote(movieId);
      // Refresh data to get updated vote counts
      await loadData();
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to cast vote. Please try again.');
    }
  };

  const handleCancelVote = async () => {
    if (!nextScreening) return;
    
    try {
      await voteAPI.cancelVote(nextScreening.id);
      setUserVote(null);
      // Refresh data to get updated vote counts
      await loadData();
    } catch (err) {
      console.error('Error cancelling vote:', err);
      setError('Failed to cancel vote. Please try again.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isVotingClosed = nextScreening ? new Date(nextScreening.date) <= new Date() : true;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Movie sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Movie Night
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.name} (@{user?.username})
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!nextScreening ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              No Upcoming Screenings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back later for the next movie night!
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center">
                🎬 Next Movie Night
              </Typography>
              <Typography variant="h6" align="center" color="primary" gutterBottom>
                {formatDate(nextScreening.date)}
              </Typography>
              {isVotingClosed ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Voting is closed for this screening.
                </Alert>
              ) : (
                <Typography variant="body1" align="center" color="text.secondary">
                  Vote for your favorite movie! You can change your vote until the screening date.
                </Typography>
              )}
            </Paper>

            <Grid container spacing={3}>
              {nextScreening.movies.map((movie) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                  <MovieCard
                    movie={movie}
                    onVote={handleVote}
                    onCancelVote={handleCancelVote}
                    hasVoted={userVote !== null}
                    userVotedFor={userVote}
                    isVotingClosed={isVotingClosed}
                  />
                </Grid>
              ))}
            </Grid>

            <Box textAlign="center" sx={{ mt: 4 }}>
              <Button variant="outlined" onClick={loadData}>
                Refresh Results
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
