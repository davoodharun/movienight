import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Rating,
  Stack,
} from '@mui/material';
import { 
  ThumbUp, 
  OpenInNew, 
  Cancel, 
  ExpandMore, 
  ExpandLess, 
  Schedule,
  EmojiEvents // Add crown/trophy icon
} from '@mui/icons-material';
import { Movie as MovieType } from '../services/api';

interface MovieCardProps {
  movie: MovieType;
  onVote: (movieId: string) => void;
  onCancelVote: () => void;
  hasVoted: boolean;
  userVotedFor: string | null;
  isVotingClosed: boolean;
  isTopVoted?: boolean; // New prop for highlighting top voted movie
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onVote,
  onCancelVote,
  hasVoted,
  userVotedFor,
  isVotingClosed,
  isTopVoted = false // Default to false
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showVoters, setShowVoters] = useState(false);
  const isUserChoice = userVotedFor === movie.id;
  const maxVotes = Math.max(...[movie.votes, 1]); // Prevent division by zero

  const handleVote = async () => {
    if (isVotingClosed || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(movie.id);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCancelVote = async () => {
    if (isVotingClosed || isVoting) return;
    
    setIsVoting(true);
    try {
      await onCancelVote();
    } finally {
      setIsVoting(false);
    }
  };

  const handleMovieSearch = () => {
    const searchQuery = `${movie.title} ${movie.year} movie`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: isUserChoice ? '2px solid #1976d2' : isTopVoted ? '3px solid #ff9800' : '1px solid #e0e0e0',
        backgroundColor: isTopVoted ? '#fff3e0' : 'inherit',
        boxShadow: isTopVoted ? 6 : 1,
        '&:hover': {
          boxShadow: isTopVoted ? 8 : 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      {/* Movie Poster */}
      {movie.metadata?.poster_path && (
        <CardMedia
          component="img"
          height="300"
          image={movie.metadata.poster_path}
          alt={`${movie.title} poster`}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {isTopVoted && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              zIndex: 1,
              backgroundColor: '#ff9800',
              borderRadius: '50%',
              p: 1,
              boxShadow: 2
            }}
          >
            <EmojiEvents sx={{ color: 'white', fontSize: 20 }} />
          </Box>
        )}
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="h3" gutterBottom>
              {movie.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {movie.year}
            </Typography>
            
            {/* Movie Rating */}
            {movie.metadata?.vote_average && movie.metadata.vote_average > 0 && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Rating 
                  value={movie.metadata.vote_average / 2} 
                  precision={0.1} 
                  size="small" 
                  readOnly 
                />
                <Typography variant="caption" color="text.secondary">
                  {movie.metadata.vote_average.toFixed(1)}/10
                </Typography>
              </Box>
            )}

            {/* Genres */}
            {movie.metadata?.genres && movie.metadata.genres.length > 0 && (
              <Box mb={1}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {movie.metadata.genres.slice(0, 3).map((genre) => (
                    <Chip 
                      key={genre} 
                      label={genre} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Runtime */}
            {movie.metadata?.runtime && (
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {movie.metadata.runtime} min
                </Typography>
              </Box>
            )}
          </Box>
          
          <Tooltip title="Search on Google">
            <IconButton size="small" onClick={handleMovieSearch}>
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Movie Overview */}
        {movie.metadata?.overview && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.85rem',
              lineHeight: 1.3
            }}>
              {movie.metadata.overview}
            </Typography>
          </Box>
        )}

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Votes: {movie.votes}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {movie.votes > 0 && (
                <Tooltip title={showVoters ? "Hide voters" : "Show voters"}>
                  <IconButton size="small" onClick={() => setShowVoters(!showVoters)}>
                    {showVoters ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Tooltip>
              )}
              {isUserChoice && (
                <Chip 
                  label="Your Vote" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(movie.votes / maxVotes) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Collapse in={showVoters && movie.votes > 0}>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Voters:
            </Typography>
            <List dense sx={{ py: 0 }}>
              {movie.voters.map((voter) => (
                <ListItem key={voter.id} sx={{ py: 0.5, px: 1 }}>
                  <ListItemText 
                    primary={voter.name}
                    secondary={`@${voter.username}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>

        <Box display="flex" gap={1}>
          {isUserChoice ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<Cancel />}
              onClick={handleCancelVote}
              disabled={isVotingClosed || isVoting}
            >
              {isVoting ? 'Cancelling...' : 'Cancel Vote'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<ThumbUp />}
              onClick={handleVote}
              disabled={isVotingClosed || isVoting}
            >
              {isVoting ? 'Voting...' : 'Vote'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
