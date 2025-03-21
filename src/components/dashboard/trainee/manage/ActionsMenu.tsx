import React from 'react';
import { Menu, MenuItem, Divider } from '@mui/material';
import {
  EditOutlined as EditIcon,
  ContentCopyOutlined as DuplicateIcon,
  DownloadOutlined as DownloadIcon,
  LockOutlined as LockIcon,
  ArchiveOutlined as ArchiveIcon,
  DeleteOutlined as DeleteIcon,
  LockOpenOutlined as UnlockIcon,
} from '@mui/icons-material';
import { SimulationData } from './types';

interface ActionsMenuProps {
  anchorEl: HTMLElement | null;
  selectedRow: SimulationData | null;
  onClose: () => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({
  anchorEl,
  selectedRow,
  onClose,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#FFFFFF', // Background color
          borderRadius: '8px', // Border radius for curved edges
          border: '1px solid #E0E0E0', // Light border around menu
          minWidth: '100px', // Small box size for menu
        },
      }}
    >
      <MenuItem
        onClick={onClose}
        sx={{
          color: '#666666', // Text color
          '& svg': {
            color: '#EBEBEB', // Icon color updated to #EBEBEB
          },
          padding: '1px 8px', // Reduced padding for smaller spacing
        }}
      >
        <EditIcon sx={{ mr: 1 }} /> Edit
      </MenuItem>
      <Divider sx={{ borderColor: '#EBEBEB' }} />{' '}
      {/* Divider color updated to #EBEBEB */}
      <MenuItem
        onClick={onClose}
        sx={{
          color: '#666666',
          '& svg': {
            color: '#EBEBEB',
          },
          padding: '1px 8px', // Reduced padding for smaller spacing
        }}
      >
        <DuplicateIcon sx={{ mr: 1 }} /> Duplicate
      </MenuItem>
      <Divider sx={{ borderColor: '#EBEBEB' }} />
      <MenuItem
        onClick={onClose}
        sx={{
          color: '#666666',
          '& svg': {
            color: '#EBEBEB',
          },
          padding: '1px 8px', // Reduced padding for smaller spacing
        }}
      >
        <DownloadIcon sx={{ mr: 1 }} /> Download Script
      </MenuItem>
      <Divider sx={{ borderColor: '#EBEBEB' }} />
      <MenuItem
        onClick={onClose}
        sx={{
          color: '#666666',
          '& svg': {
            color: '#EBEBEB',
          },
          padding: '1px 8px', // Reduced padding for smaller spacing
        }}
      >
        {selectedRow?.isLocked ? (
          <>
            <UnlockIcon sx={{ mr: 1 }} /> Unlock
          </>
        ) : (
          <>
            <LockIcon sx={{ mr: 1 }} /> Lock
          </>
        )}
      </MenuItem>
      <Divider sx={{ borderColor: '#EBEBEB' }} />
      <MenuItem
        onClick={onClose}
        sx={{
          color: '#666666',
          '& svg': {
            color: '#EBEBEB',
          },
          padding: '1px 8px', // Reduced padding for smaller spacing
        }}
      >
        <ArchiveIcon sx={{ mr: 1 }} /> Archive
      </MenuItem>
      <Divider sx={{ borderColor: '#EBEBEB' }} />
      <MenuItem
        onClick={onClose}
        sx={{
          color: '#666666',
          '& svg': {
            color: '#EBEBEB',
          },
          padding: '1px 8px', // Reduced padding for smaller spacing
        }}
      >
        <DeleteIcon sx={{ mr: 1 }} /> Delete
      </MenuItem>
    </Menu>
  );
};

export default ActionsMenu;
