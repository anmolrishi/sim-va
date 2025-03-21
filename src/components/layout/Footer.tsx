import React from 'react';
import { Stack, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Stack
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 2,
        position: 'sticky',
        bottom: 0,
        zIndex: 1100
      }}
    >
      <Container>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} EverAI Simulator. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link
              href="#"
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'text.primary'
                }
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'text.primary'
                }
              }}
            >
              Terms of Service
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
};

export default Footer;