import React, { useState, useEffect } from 'react';
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
  Box,
  Tabs,
  Tab,
  SelectChangeEvent,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  LockOutlined as LockIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import DashboardContent from '../DashboardContent';
import AssignTrainingPlanDialog from './AssignTrainingPlanDialog';
import { fetchAssignments, type Assignment } from '../../../services/assignments';
import { useAuth } from '../../../context/AuthContext';

const formatDate = (dateString: string) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AssignSimulationsPage = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('Training Plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState('All Tags');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCreator, setSelectedCreator] = useState('Created By');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAssignments();
        setAssignments(data);
      } catch (err) {
        setError('Failed to load assignments');
        console.error('Error loading assignments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAssignDialog = () => {
    setIsAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setIsAssignDialogOpen(false);
  };

  const filteredData = assignments.filter((item) => {
    // First apply tab filter
    if (currentTab === 'Training Plans' && item.type !== 'TrainingPlan') {
      return false;
    }
    if (currentTab === 'Modules' && item.type !== 'Module') {
      return false;
    }
    if (currentTab === 'Simulations' && item.type !== 'Simulation') {
      return false;
    }

    // Then apply search filter
    if (searchQuery && !item.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <DashboardContent>
      <Container>
        <Stack spacing={4} sx={{ py: 4 }}>
          {/* Header */}
          <Stack>
            <Typography variant="h4" fontWeight="medium">
              Assign Simulations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Assign simulation, modules and training plan to the trainee
            </Typography>
          </Stack>

          {/* Tabs and Create Button */}
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
              <Tab label="Training Plans" value="Training Plans" />
              <Tab label="Modules" value="Modules" />
              <Tab label="Simulations" value="Simulations" />
            </Tabs>
            <Button
              variant="contained"
              onClick={handleOpenAssignDialog}
              sx={{
                bgcolor: '#444CE7',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Assign Training Plan
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
              placeholder="Search by Assignment Name or ID"
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

          {/* Table */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Alert severity="error">{error}</Alert>
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
            <Box
              sx={{
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <Table sx={{ minWidth: 1700, borderRadius: 2, overflow: 'hidden' }}>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>ID No.</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Assignment Name</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Type</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Teams</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Trainees</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Start Date</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Due Date</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Status</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Last Modified</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Modified by</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Created On</TableCell>
                    <TableCell sx={{ color: '#959697', padding: '6px 16px' }}>Created by</TableCell>
                    <TableCell align="right" sx={{ color: '#959697', padding: '6px 16px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>
                          {row.name || 'Untitled Assignment'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.type}
                            size="small"
                            sx={{
                              bgcolor: '#F5F6FF',
                              color: '#444CE7',
                            }}
                          />
                        </TableCell>
                        <TableCell>{row.team_id?.length || 0} Teams</TableCell>
                        <TableCell>{row.trainee_id?.length || 0} Trainees</TableCell>
                        <TableCell>{formatDate(row.start_date)}</TableCell>
                        <TableCell>{formatDate(row.end_date)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                bgcolor: '#F5F6FF',
                                color: '#444CE7',
                              }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">{formatDate(row.last_modified_at)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(row.last_modified_at).toLocaleTimeString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">{row.last_modified_by}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.last_modified_by}@everailabs.com
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">{formatDate(row.created_at)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(row.created_at).toLocaleTimeString()}
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
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
            <Box
              sx={{
                bgcolor: '#F9FAFB',
                borderTop: '1px solid rgba(224, 224, 224, 1)',
              }}
            >
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

      <AssignTrainingPlanDialog
        open={isAssignDialogOpen}
        onClose={handleCloseAssignDialog}
      />
    </DashboardContent>
  );
};

export default AssignSimulationsPage;