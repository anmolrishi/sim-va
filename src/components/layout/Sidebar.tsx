import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Stack,
  Typography,
  Tooltip,
  Divider,
  styled
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  MenuBook as MenuBookIcon,
  PlayCircle as PlayCircleIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  SmartToy as SmartToyIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import { hasPermission } from '../../utils/permissions';

interface SidebarProps {
  isCollapsed: boolean;
}

const NavLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.active': {
    backgroundColor: theme.palette.primary.lighter,
    color: theme.palette.primary.main,
  }
}));

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: BarChartIcon, label: 'Dashboard' },
    { path: '/training', icon: MenuBookIcon, label: 'Training plan' },
    { path: '/playback', icon: PlayCircleIcon, label: 'Playback' },
    { path: '/assign-simulations', icon: AssignmentIcon, label: 'Assign Simulations' },
    { path: '/manage-simulations', icon: SmartToyIcon, label: 'Manage Simulations' },
    { path: '/manage-training-plan', icon: BookIcon, label: 'Manage Training Plan', divider: true },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
    { path: '/support', icon: HelpIcon, label: 'Help & Support' },
    { path: '/feedback', icon: FeedbackIcon, label: 'Feedback' }
  ]
    // .filter(item => hasPermission(item.path));

  return (
    <Stack
      sx={{
        width: isCollapsed ? 72 : 256,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'width 0.2s ease',
        height: '100%'
      }}
    >
      <Stack spacing={4} sx={{ py: 2 }}>
        <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
          {navItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <Tooltip
                title={isCollapsed ? item.label : ''}
                placement="right"
              >
                <NavLink
                  to={item.path}
                  className={isActive(item.path) ? 'active' : ''}
                  sx={{
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    px: isCollapsed ? 1 : 1.5
                  }}
                >
                  <item.icon sx={{ fontSize: 20 }} />
                  {!isCollapsed && <Typography>{item.label}</Typography>}
                </NavLink>
              </Tooltip>
              {item.divider && (
                <Divider sx={{ my: 2 }} />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Sidebar;