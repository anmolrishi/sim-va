import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import GroupIcon from '@mui/icons-material/Group';
import CancelIcon from '@mui/icons-material/Cancel';
import WaveSurfer from 'wavesurfer.js';

const PlaybackControls = () => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showWaveforms, setShowWaveforms] = useState(false);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#C2C2C2',
        progressColor: '#007AFF',
        cursorColor: '#000000',
        barWidth: 4,
        barGap: 2,
        barRadius: 1,
        height: 40,
        normalize: true,
        backgroundColor: '#FFFFFF',
        barMinHeight: 1,
      });

      // Load audio file (replace with your actual audio file)
      wavesurferRef.current.load('/src/assets/script2.mp3');

      wavesurferRef.current.on('ready', () => {
        setDuration(Math.floor(wavesurferRef.current?.getDuration() || 0));
      });

      wavesurferRef.current.on('audioprocess', () => {
        setCurrentTime(
          Math.floor(wavesurferRef.current?.getCurrentTime() || 0)
        );
      });

      wavesurferRef.current.on('play', () => setIsPlaying(true));
      wavesurferRef.current.on('pause', () => setIsPlaying(false));

      return () => {
        wavesurferRef.current?.destroy();
      };
    }
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
    }
  };

  const handleGroupClick = () => {
    setShowWaveforms((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 950,
        margin: '0 auto',
        padding: 2,
        backgroundColor: '#F9FAFB',
        border: '1px solid #ddd',
        borderRadius: 2,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Stack spacing={2}>
        {/* Main Controls */}
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={handlePlayPause} sx={{ width: 48, height: 48 }}>
            {isPlaying ? (
              <PauseIcon fontSize="large" sx={{ color: 'black' }} />
            ) : (
              <PlayArrowIcon fontSize="large" sx={{ color: 'black' }} />
            )}
          </IconButton>

          <Typography sx={{ color: 'black' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Box
            sx={{
              flex: 1,
              bgcolor: 'white',
              borderRadius: '32px',
              padding: 1,
              height: 40,
              overflow: 'hidden',
            }}
          >
            <div ref={waveformRef} style={{ width: '100%', height: '100%' }} />
          </Box>

          <IconButton onClick={handleGroupClick} sx={{ width: 48, height: 48 }}>
            {showWaveforms ? (
              <CancelIcon fontSize="large" sx={{ color: 'black' }} />
            ) : (
              <GroupIcon fontSize="large" sx={{ color: 'black' }} />
            )}
          </IconButton>
        </Stack>

        {/* Additional Waveforms (if needed) */}
        {showWaveforms && (
          <Stack spacing={2}>{/* Add your additional waveforms here */}</Stack>
        )}
      </Stack>
    </Box>
  );
};

export default PlaybackControls;
