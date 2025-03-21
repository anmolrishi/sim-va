import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Timer } from '@mui/icons-material';

interface CompletionTimeProps {
  time: string | number; // Time can be a string (e.g., "26m 54s") or a number (e.g., seconds)
  label?: string; // Optional label, e.g., "Completion Time"
  icon?: React.ReactNode; // Optional icon component
}

const formatTime = (time: number | string): string => {
  if (typeof time === 'number') {
    // Convert number (in seconds) to "mm:ss" format
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}m ${seconds}s`;
  }
  // If time is already a string, return as-is
  return time;
};

const CompletionTime: React.FC<CompletionTimeProps> = ({
  time,
  label = 'Completion Time',
  icon = <Timer fontSize="small" />, // Default to Timer icon
}) => {
  return (
    <Box
      display="flex"
      alignItems="flex-start" // Align items to the top
      justifyContent="space-between"
    >
      {/* Icon */}
      <Avatar
        sx={{
          backgroundColor: '#F4F7FE',
          color: '#484B85',
          width: 32,
          height: 32,
        }}
      >
        {icon}
      </Avatar>

      {/* Text Content */}
      <Box
        marginLeft="12px"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: '#ADADAD',
            marginBottom: '4px', // Optional: add space between label and time
            wordWrap: 'break-word', // Allow label to break onto next line
            maxWidth: '100px', // Optional: you can set a max width to control label length
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#3A3A3A',
          }}
        >
          {formatTime(time)}
        </Typography>
      </Box>
    </Box>
  );
};

export default CompletionTime;
