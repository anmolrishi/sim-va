import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stack, 
  Avatar, 
  Menu, 
  MenuItem, 
  Typography,
  IconButton,
  Box,
  Container,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ProfileDetailsDialog from '../profile/ProfileDetailsDialog';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    marginTop: theme.spacing(1),
    minWidth: 280,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
  }
}));

const OnlineIndicator = styled('div')(({ theme }) => ({
  width: 8,
  height: 8,
  backgroundColor: '#12B76A',
  borderRadius: '50%',
  border: `2px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: 2,
  right: 2,
}));

const UserInfo = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const MenuItem2 = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  '& .MuiSvgIcon-root': {
    fontSize: 20,
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  }
}));

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleOpenProfile = () => {
    handleClose();
    setIsProfileOpen(true);
  };

  return (
    <Stack
      component="header"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 1100
      }}
    >
      <Container maxWidth={false}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ height: 64 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={onToggleSidebar}>
              <MenuOpenIcon 
                sx={{ 
                  transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s'
                }} 
              />
            </IconButton>
            <Box
              component="img"
              src="/src/assets/logo.svg"
              alt="Logo"
              sx={{
                height: 32,
                width: 'auto'
              }}
            />
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack 
              alignItems="flex-end" 
              sx={{
                bgcolor: 'rgba(0, 30, 238, 0.04)',
                px: 2,
                py: 1,
                borderRadius: 3,
                fontFamily: 'Inter'
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 400,
                  fontFamily: 'Inter'
                }}
              >
                {user?.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  textTransform: 'capitalize',
                  fontFamily: 'Inter'
                }}
              >
                {user?.role.replace('_', ' ')}
              </Typography>
            </Stack>
            <IconButton
              onClick={handleClick}
              size="small"
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#F2F4F7', color: '#475467' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <OnlineIndicator />
              </Box>
            </IconButton>
          </Stack>

          <StyledMenu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <UserInfo spacing={0.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: '#F2F4F7', color: '#475467' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <OnlineIndicator />
                </Box>
                <Stack spacing={0}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user?.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'primary.main',
                      bgcolor: '#F5F6FF',
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      display: 'inline-block',
                      width: 'fit-content'
                    }}
                  >
                    {user?.email}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {user?.role.replace('_', ' ')}
                  </Typography>
                </Stack>
              </Stack>
            </UserInfo>
            
            <Divider />
            
            <MenuItem2 onClick={handleOpenProfile}>
              <AccountCircleOutlinedIcon />
              <Typography>My Profile</Typography>
            </MenuItem2>
            
            <MenuItem2 onClick={handleLogout}>
              <LogoutOutlinedIcon />
              <Typography>Log Out</Typography>
            </MenuItem2>
          </StyledMenu>

          <ProfileDetailsDialog 
            open={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
          />
        </Stack>
      </Container>
    </Stack>
  );
};

export default Header;