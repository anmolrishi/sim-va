import React from 'react';
import { Stack, Container } from '@mui/material';
import Layout from '../../layout/Layout';
import DashboardContent from '../DashboardContent';
import PlaybackHeader from './playback/PlaybackHeader';
import PlaybackStats from './playback/PlaybackStats';
import PlaybackTable from './playback/PlaybackTable';

const PlaybackPage = () => {
  return (

      <DashboardContent>
        <Container>
          <Stack spacing={4} sx={{ py: 4 }}>
            <PlaybackHeader />
            <Stack spacing={5}>
              <PlaybackStats />
              <PlaybackTable />
            </Stack>
          </Stack>
        </Container>
      </DashboardContent>

  );
};

export default PlaybackPage;