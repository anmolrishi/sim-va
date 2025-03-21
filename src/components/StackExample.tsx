import React from 'react';
import { Stack, Paper, Button } from '@mui/material';
import { Mail, Phone, MapPin } from 'lucide-react';

const StackExample = () => {
  return (
    <div className="p-8">
      {/* Vertical Stack */}
      <Stack spacing={2} className="mb-8">
        <Paper className="p-4">
          <Stack direction="row" spacing={2} alignItems="center">
            <Mail className="text-gray-600" />
            <span>contact@example.com</span>
          </Stack>
        </Paper>
        
        <Paper className="p-4">
          <Stack direction="row" spacing={2} alignItems="center">
            <Phone className="text-gray-600" />
            <span>+1 234 567 890</span>
          </Stack>
        </Paper>
        
        <Paper className="p-4">
          <Stack direction="row" spacing={2} alignItems="center">
            <MapPin className="text-gray-600" />
            <span>123 Business Street, City, Country</span>
          </Stack>
        </Paper>
      </Stack>

      {/* Horizontal Stack */}
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="center"
      >
        <Button variant="contained" color="primary">
          Save
        </Button>
        <Button variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button variant="text">
          Reset
        </Button>
      </Stack>
    </div>
  );
};

export default StackExample;