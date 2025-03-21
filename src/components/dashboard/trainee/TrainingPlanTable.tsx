import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Grid,
  Paper,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  Pagination,
  Box,
  styled,
} from '@mui/material';
import type { TrainingPlan } from '../../../types/training';

interface TrainingPlanTableProps {
  trainingPlans: TrainingPlan[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
}));

const HeaderChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  height: 24,
  fontSize: '0.75rem',
}));

const TrainingPlanTable: React.FC<TrainingPlanTableProps> = ({ trainingPlans }) => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState('50');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');


  const totalSimulations = trainingPlans.reduce(
    (acc, plan) => acc + plan.total_simulations,
    0
  );

  const getStatusColor = (status: TrainingPlan['status']) => {
    switch (status) {
      case 'ongoing':
        return { bg: '#EEF4FF', color: '#3538CD' };
      case 'finished':
        return { bg: '#ECFDF3', color: '#027A48' };
      default:
        return { bg: '#FFFAEB', color: '#B54708' };
    }
  };

  const filteredPlans = trainingPlans.filter((plan) => {
    if (searchQuery && !plan.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && plan.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" fontWeight="600">Training Plan</Typography>
          <HeaderChip label={`${totalSimulations} Simulations`} size="small" />
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: '#F9FAFB',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          placeholder="Search"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 240 }}
        />
        <Stack direction="row" spacing={2}>
          <Select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            size="small"
            sx={{
              minWidth: 120,
              bgcolor: 'background.paper',
            }}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="7days">Next 7 Days</MenuItem>
            <MenuItem value="30days">Next 30 Days</MenuItem>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{
              minWidth: 120,
              bgcolor: 'background.paper',
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="not_started">Not Started</MenuItem>
            <MenuItem value="ongoing">Ongoing</MenuItem>
            <MenuItem value="finished">Finished</MenuItem>
          </Select>
        </Stack>
      </Paper>

      <StyledPaper>
        <Grid container sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Grid item xs={1.5}>
            <Typography variant="subtitle2" color="text.secondary">ID No.</Typography>
          </Grid>
          <Grid item xs={2.5}>
            <Typography variant="subtitle2" color="text.secondary">Training Plan</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" color="text.secondary">No. of Modules</Typography>
          </Grid>
          <Grid item xs={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Est. Time</Typography>
          </Grid>
          <Grid item xs={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Score</Typography>
          </Grid>
          <Grid item xs={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
          </Grid>
          <Grid item xs={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
          </Grid>
        </Grid>

        {filteredPlans.map((plan) => (
          <Grid
            key={plan.id}
            container
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer',
              },
            }}
            onClick={() => navigate(`/training/${plan.id}`)}
          >
            <Grid item xs={1.5}>
              <Typography variant="body2">{plan.id}</Typography>
            </Grid>
            <Grid item xs={2.5}>
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight="500">
                  {plan.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {plan.completion_percentage}% completed
                </Typography>
                <Box sx={{
                  height: 2,
                  width: '100%',
                  bgcolor: 'primary.50',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    height: '100%',
                    width: `${plan.completion_percentage}%`,
                    bgcolor: 'primary.main',
                  }} />
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2">
                {plan.total_modules} Modules | {plan.total_simulations} Sims
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              <Typography variant="body2">{plan.est_time}m</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <Typography
                variant="body2"
                sx={{
                  color: plan.average_sim_score >= 80 ? 'success.main' :
                    plan.average_sim_score >= 60 ? 'warning.main' : 'error.main',
                }}
              >
                {plan.average_sim_score}%
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              <Typography variant="body2">{plan.due_date || 'No due date'}</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <Chip
                label={plan.status.replace('_', ' ')}
                size="small"
                sx={{
                  bgcolor: getStatusColor(plan.status).bg,
                  color: getStatusColor(plan.status).color,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            </Grid>
          </Grid>
        ))}
      </StyledPaper>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(e.target.value)}
            size="small"
            sx={{ minWidth: 70 }}
          >
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="20">20</MenuItem>
            <MenuItem value="50">50</MenuItem>
            <MenuItem value="100">100</MenuItem>
          </Select>
        </Stack>
        <Pagination
          count={Math.ceil(filteredPlans.length / parseInt(rowsPerPage))}
          shape="rounded"
          size="small"
        />
      </Stack>
    </Stack>
  );
};

export default TrainingPlanTable;