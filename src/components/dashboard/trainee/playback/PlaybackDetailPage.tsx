import React, { useState } from 'react';
import Layout from '../../../layout/Layout';
import DashboardContent from '../../DashboardContent';
import { useParams } from 'react-router-dom';
import PlaybackHeader from './detail/PlaybackHeader';
import PlaybackChat from './detail/PlaybackChat';
import PlaybackDetails from './detail/PlaybackDetails';
import PlaybackControls from './detail/PlaybackControls';
import { Stack } from '@mui/material';

const PlaybackDetailPage = () => {
  const { id } = useParams();
  const [showDetails, setShowDetails] = useState(true);

  return (
      <DashboardContent>
        <Stack>
          <PlaybackHeader
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails(!showDetails)}
          />
          <Stack direction="row" spacing={2}>
            <Stack flex={1} spacing={2}>
              <PlaybackChat />
              <PlaybackControls />
            </Stack>
            {showDetails && <PlaybackDetails />}
          </Stack>
        </Stack>
      </DashboardContent>
  );
};

export default PlaybackDetailPage;
