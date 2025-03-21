import React from 'react';
import { Stack } from '@mui/material';

interface DashboardContentProps {
  children: React.ReactNode;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ children }) => {
  return (
    <Stack sx={{ flex: 1 }}>
      {children}
    </Stack>
  );
};

export default DashboardContent;