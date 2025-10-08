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
import ScreeningSelector from './ScreeningSelector';
import MovieSuggestions from './MovieSuggestions';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [allScreenings, setAllScreenings] = useState<MovieScreening[]>([]);
  const [selectedScreening, setSelectedScreening] = useState<MovieScreening | null>(null);
  const [selectedScreeningId, setSelectedScreeningId] = useState<string | null>(null);
  const [nextScreeningId, setNextScreeningId] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all screenings
      const allScreeningsData = await movieAPI.getAllScreenings();
      setAllScreenings(allScreeningsData.screenings);
      
      // Get the next screening
      const nextScreeningData = await movieAPI.getNextScreening();
      const nextScreening = nextScreeningData.screening;
      
      if (nextScreening) {
        setNextScreeningId(nextScreening.id);
        
        // If no screening is selected yet, default to the next screening
        if (!selectedScreeningId) {
          setSelectedScreeningId(nextScreening.id);
          setSelectedScreening(nextScreening);
          
          // Get user vote for this screening
          const voteData = await voteAPI.getMyVote(nextScreening.id);
          setUserVote(voteData.vote?.movieId || null);
        }
      } else if (allScreeningsData.screenings.length > 0 && !selectedScreeningId) {
        // If no next screening, default to the first available screening
        const firstScreening = allScreeningsData.screenings[0];
        setSelectedScreeningId(firstScreening.id);
        setSelectedScreening(firstScreening);
        
        const voteData = await voteAPI.getMyVote(firstScreening.id);
        setUserVote(voteData.vote?.movieId || null);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load movie data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScreeningSelect = async (screeningId: string) => {
    try {
      setLoading(true);
      setSelectedScreeningId(screeningId);
      
      // Load the selected screening data
      const screeningData = await movieAPI.getScreeningById(screeningId);
      setSelectedScreening(screeningData.screening);
      
      // Get user vote for this screening
      if (screeningData.screening) {
        const voteData = await voteAPI.getMyVote(screeningData.screening.id);
        setUserVote(voteData.vote?.movieId || null);
      }
    } catch (err) {
      console.error('Error loading screening:', err);
      setError('Failed to load screening data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (movieId: string) => {
    if (!selectedScreening) return;
    
    try {
      await voteAPI.castVote(movieId, selectedScreening.id);
      setUserVote(movieId);
      // Refresh the selected screening to get updated vote counts
      await handleScreeningSelect(selectedScreening.id);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to cast vote. Please try again.');
    }
  };

  const handleCancelVote = async () => {
    if (!selectedScreening) return;
    
    try {
      await voteAPI.cancelVote(selectedScreening.id);
      setUserVote(null);
      // Refresh the selected screening to get updated vote counts
      await handleScreeningSelect(selectedScreening.id);
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

  const isVotingClosed = selectedScreening ? new Date(selectedScreening.date) <= new Date() : true;

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

        {!selectedScreening ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              No Screenings Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back later for upcoming movie nights!
            </Typography>
          </Paper>
        ) : (
          <>
            <ScreeningSelector 
              screenings={allScreenings}
              selectedScreeningId={selectedScreeningId}
              onScreeningSelect={handleScreeningSelect}
              nextScreeningId={nextScreeningId}
            />
            
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center">
                🎬 Movie Night
              </Typography>
              {selectedScreening.theme && (
                <Typography variant="h5" align="center" color="secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                  {selectedScreening.theme}
                </Typography>
              )}
              <Typography variant="h6" align="center" color="primary" gutterBottom>
                {formatDate(selectedScreening.date)}
              </Typography>
              {selectedScreeningId === nextScreeningId && (
                <Typography variant="body2" align="center" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                  ⏰ Next Screening
                </Typography>
              )}
              {selectedScreeningId !== nextScreeningId && new Date(selectedScreening.date) > new Date() && (
                <Typography variant="body2" align="center" color="info.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                  🔮 Future Screening
                </Typography>
              )}
              {isVotingClosed && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Voting is closed for this screening.
                </Alert>
              )}
              {!isVotingClosed && (
                <Typography variant="body1" align="center" color="text.secondary">
                  Vote for your favorite movie! You can change your vote until the screening date.
                </Typography>
              )}
            </Paper>

            <Grid container spacing={3}>
              {selectedScreening.movies
                .slice() // Create a copy to avoid mutating the original
                .sort((a, b) => b.votes - a.votes) // Sort by votes descending
                .map((movie, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                  <MovieCard
                    movie={movie}
                    onVote={handleVote}
                    onCancelVote={handleCancelVote}
                    hasVoted={userVote !== null}
                    userVotedFor={userVote}
                    isVotingClosed={isVotingClosed}
                    isTopVoted={index === 0 && movie.votes > 0} // Highlight first movie if it has votes
                  />
                </Grid>
              ))}
            </Grid>

            <Box textAlign="center" sx={{ mt: 4 }}>
              <Button variant="outlined" onClick={loadData}>
                Refresh Results
              </Button>
            </Box>

            {/* Movie Suggestions Section */}
            <MovieSuggestions 
              screeningId={selectedScreening.id}
              screeningTheme={selectedScreening.theme}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
