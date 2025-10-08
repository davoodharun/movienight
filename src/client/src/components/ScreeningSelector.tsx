import React from 'react';
import {
  Box,
  Chip,
  Typography,
  Stack,
  Paper
} from '@mui/material';
import { CalendarMonth, Schedule, Upcoming } from '@mui/icons-material';
import { MovieScreening } from '../services/api';

interface ScreeningSelectorProps {
  screenings: MovieScreening[];
  selectedScreeningId: string | null;
  onScreeningSelect: (screeningId: string) => void;
  nextScreeningId: string | null; // ID of the screening that comes next chronologically
}

const ScreeningSelector: React.FC<ScreeningSelectorProps> = ({
  screenings,
  selectedScreeningId,
  onScreeningSelect,
  nextScreeningId
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if it's today
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return {
        date: 'Today',
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    }
    
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const isScreeningInPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (screenings.length <= 1) {
    return null; // Don't show selector if there's only one or no screenings
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CalendarMonth color="primary" />
        <Typography variant="h6" component="h2">
          Select Movie Night
        </Typography>
      </Box>
      
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {screenings
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((screening) => {
            const { date, time } = formatDate(screening.date);
            const isSelected = selectedScreeningId === screening.id;
            const isNext = nextScreeningId === screening.id;
            const isPast = isScreeningInPast(screening.date);
            
            return (
              <Chip
                key={screening.id}
                icon={isNext ? <Upcoming /> : <Schedule />}
                label={
                  <Box>
                    <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                      {date} at {time}
                    </Typography>
                    {screening.theme && (
                      <Typography variant="caption" component="div" sx={{ fontStyle: 'italic' }}>
                        {screening.theme}
                      </Typography>
                    )}
                    {isNext && (
                      <Typography variant="caption" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Next Screening
                      </Typography>
                    )}
                    {isPast && (
                      <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                        Past Event
                      </Typography>
                    )}
                  </Box>
                }
                variant={isSelected ? "filled" : "outlined"}
                color={isNext ? "primary" : isPast ? "default" : "secondary"}
                onClick={() => onScreeningSelect(screening.id)}
                sx={{
                  height: 'auto',
                  p: 1.5,
                  '& .MuiChip-label': {
                    display: 'block',
                    whiteSpace: 'normal',
                    textAlign: 'left'
                  },
                  cursor: 'pointer',
                  border: isSelected ? '2px solid' : undefined,
                  borderColor: isSelected ? (isNext ? 'primary.main' : 'secondary.main') : undefined
                }}
              />
            );
          })}
      </Stack>
    </Paper>
  );
};

export default ScreeningSelector;
