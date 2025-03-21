import React from 'react';
import { Stack, Container } from '@mui/material';
import Layout from '../../../layout/Layout';
import DashboardContent from '../../DashboardContent';
import PlaybackHeader from './PlaybackHeader';
import PlaybackStats from './PlaybackStats';
import PlaybackTable from './PlaybackTable';

const PlaybackPage = () => {
  return (
    <Layout>
      <DashboardContent>
        <Container>
          <Stack spacing={4} sx={{ py: 4 }}>
            <PlaybackHeader />
              <PlaybackStats />
            <Stack spacing={8}>
              <PlaybackTable />
            </Stack>
          </Stack>
        </Container>
      </DashboardContent>
    </Layout>
  );
};

export default PlaybackPage;