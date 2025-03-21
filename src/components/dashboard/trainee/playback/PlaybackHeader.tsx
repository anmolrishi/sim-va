import React from 'react';
import { Stack, Typography } from '@mui/material';

const PlaybackHeader = () => {
  return (
    <Stack spacing={1}>
      <Typography variant="h4" fontWeight="medium">
        Playback
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Playback and Evaluate Your Training Simulations
      </Typography>
    </Stack>
  );
};

export default PlaybackHeader;