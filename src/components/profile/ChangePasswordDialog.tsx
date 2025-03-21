import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  email,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = () => {
    // Add password reset logic here
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: '100%',
          maxWidth: 600,
        }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: '#F5F6FF', width: 48, height: 48 }}>
            <PersonIcon sx={{ color: '#444CE7' }} />
          </Avatar>
          <Stack spacing={0.5} flex={1}>
            <Typography variant="h6" sx={{ fontFamily: 'Inter', fontWeight: 500 }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter' }}>
              Change your account password
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              bgcolor: '#F9FAFB',
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter' }}>
              Email:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Inter' }}>
              {email}
            </Typography>
            <Typography
              sx={{
                bgcolor: '#fff',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontFamily: 'Inter',
              }}
            >
              Trainee
            </Typography>
          </Stack>

          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputLabelProps={{ sx: { fontFamily: 'Inter' } }}
              InputProps={{ sx: { fontFamily: 'Inter' } }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputLabelProps={{ sx: { fontFamily: 'Inter' } }}
              InputProps={{ sx: { fontFamily: 'Inter' } }}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontFamily: 'Inter',
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleReset}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontFamily: 'Inter',
            bgcolor: '#444CE7',
            '&:hover': {
              bgcolor: '#3538CD',
            },
          }}
        >
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;