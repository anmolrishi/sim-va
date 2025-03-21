import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Stack,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Box,
  Chip,
  Tabs,
  Tab,
  SelectChangeEvent,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import DashboardContent from '../../DashboardContent';
import ActionsMenu from './ActionsMenu';
import CreateSimulationDialog from './CreateSimulationDialog';
import { fetchSimulations, Simulation } from '../../../../services/simulations';
import { useAuth } from '../../../../context/AuthContext';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ManageSimulationsPage = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState('All Tags');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments & Divisions');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCreator, setSelectedCreator] = useState('Created By');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Simulation | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSimulations = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSimulations(user?.id || 'user123');
        setSimulations(data);
        setError(null);
      } catch (err) {
        setError('Failed to load simulations');
        console.error('Error loading simulations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimulations();
  }, [user?.id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    row: SimulationData
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter data based on current tab and search query
  const filteredData = useMemo(() => {
    return simulations.filter((row) => {
      // First apply tab filter
      if (currentTab !== 'All' && row.status.toLowerCase() !== currentTab.toLowerCase()) {
        return false;
      }

      // Then apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          row.sim_name.toLowerCase().includes(searchLower) ||
          row.id.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [currentTab, searchQuery, simulations]);

  return (
    <DashboardContent>
      <Container>
        <Stack spacing={3} sx={{ py: 4 }}>
          {/* Header */}
          <Stack >
            <Typography variant="h4" fontWeight="medium">
              Manage Simulations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create assign and manage your simulations
            </Typography>
          </Stack>

          {/* Update Create Button to open dialog */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 3,
                  bgcolor: '#F9FAFB',
                  color: '#AEAFB0',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: '#EDEFF1',
                  },
                  '&.Mui-selected': {
                    color: '#323232',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <Tab label="All" value="All" />
              <Tab label="Published" value="Published" />
              <Tab label="Draft" value="Draft" />
              <Tab label="Archive" value="Archive" />
            </Tabs>
            <Button
              variant="contained"
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Create Simulation
            </Button>
          </Stack>

          {/* Filters */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{
              bgcolor: '#F9FAFB',
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <TextField
              placeholder="Search by Sim Name or ID"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 300,
                bgcolor: '#FFFFFF',
                borderRadius: 10,
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                ),
              }}
            />

            <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
              <Select
                value={selectedTags}
                onChange={(e: SelectChangeEvent) => setSelectedTags(e.target.value)}
                size="small"
                sx={{
                  minWidth: 120,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                }}
              >
                <MenuItem value="All Tags">All Tags</MenuItem>
              </Select>
              <Select
                value={selectedDepartment}
                onChange={(e: SelectChangeEvent) =>
                  setSelectedDepartment(e.target.value)
                }
                size="small"
                sx={{
                  minWidth: 200,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                }}
              >
                <MenuItem value="All Departments & Divisions">
                  All Departments & Divisions
                </MenuItem>
              </Select>
              <Select
                value={selectedStatus}
                onChange={(e: SelectChangeEvent) => setSelectedStatus(e.target.value)}
                size="small"
                sx={{
                  minWidth: 120,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                }}
              >
                <MenuItem value="All Status">All Status</MenuItem>
              </Select>
              <Select
                value={selectedCreator}
                onChange={(e: SelectChangeEvent) => setSelectedCreator(e.target.value)}
                size="small"
                sx={{
                  minWidth: 120,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                }}
              >
                <MenuItem value="Created By">Created By</MenuItem>
              </Select>
            </Stack>
          </Stack>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 4, color: 'error.main' }}>
              <Typography>{error}</Typography>
            </Box>
          ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              <Table sx={{ minWidth: 1700, borderRadius: 2, overflow: 'hidden' }}>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Sim ID</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Sim Name</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Version</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Level</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Sim Type</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Status</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Tags</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Est. Time</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Last Modified</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Modified by</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Created On</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Created by</TableCell>
                    <TableCell align="right" sx={{ color: '#959697', padding: '6px 16px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {row.sim_name}
                          {row.islocked && (
                            <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>v{row.version}</TableCell>
                      <TableCell>Lvl 02</TableCell>
                      <TableCell>
                        <Chip
                          label={row.sim_type}
                          size="small"
                          sx={{ bgcolor: '#F5F6FF', color: '#444CE7' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            bgcolor:
                              row.status === 'Published'
                                ? '#ECFDF3'
                                : row.status === 'Draft'
                                  ? '#F5F6FF'
                                  : '#F9FAFB',
                            color:
                              row.status === 'Published'
                                ? '#027A48'
                                : row.status === 'Draft'
                                  ? '#444CE7'
                                  : '#344054',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {row.tags.map((tag, i) => (
                            <Chip
                              key={i}
                              label={tag}
                              size="small"
                              sx={{ bgcolor: '#F5F6FF', color: '#444CE7' }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>{row.estTime}</TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{formatDate(row.last_modified)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(row.last_modified).toLocaleTimeString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{row.modified_by}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.modified_by}@everailabs.com
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{formatDate(row.created_on)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(row.created_on).toLocaleTimeString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{row.created_by}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.created_by}@everailabs.com
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(event) => handleMenuOpen(event, row)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box sx={{ bgcolor: '#F9FAFB', borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            </Box>
          </TableContainer>
          )}
        </Stack>
      </Container>

      <ActionsMenu
        anchorEl={anchorEl}
        selectedRow={selectedRow}
        onClose={handleMenuClose}
      />

      <CreateSimulationDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </DashboardContent>
  );
};

export default ManageSimulationsPage;