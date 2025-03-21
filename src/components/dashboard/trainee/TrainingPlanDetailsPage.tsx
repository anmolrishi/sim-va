import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Stack,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  Grid,
  Chip,
  Select,
  MenuItem,
  Pagination,
  Box,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardContent from '../DashboardContent';
import { useAuth } from '../../../context/AuthContext';
import { fetchTrainingData } from '../../../services/training';
import type { Module, TrainingPlan, Simulation } from '../../../types/training';

const TrainingPlanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('50');
  var [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
  // Simulating API response
  const mockData = {
    "user_id": "userId11",
    "training_plans": [
      {
        "id": "45893",
        "name": "Advanced Leadership Training",
        "total_modules": 3,
        "total_simulations": 5,
        "est_time": 90,
        "average_sim_score": 86,
        "completion_percentage": 92,
        "due_date": "2024-12-25",
        "status": "ongoing",
        "modules": [
          {
            "id": "M101",
            "name": "Leadership Fundamentals",
            "total_simulations": 2,
            "average_score": 85,
            "due_date": "2024-12-20",
            "status": "ongoing",
            "simulations": [
              {
                "simulation_id": "67c716139e65ee61e0882a29",
                "name": "Decision Making",
                "highest_attempt_score": 87,
                "due_date": "2024-12-18",
                "status": "finished"
              },
              {
                "simulation_id": "67c716139e65ee61e0882a29",
                "name": "Conflict Resolution",
                "highest_attempt_score": 82,
                "due_date": "2024-12-19",
                "status": "ongoing"
              }
            ]
          }
        ]
      }
    ]
  };

  // Find the correct training plan based on the URL param `id`
  const selectedPlan = mockData.training_plans.find(plan => plan.id === id);

  // Set the state with the selected plan
  if (selectedPlan) {
    setTrainingPlan(selectedPlan);
  }
}, [id]); // Runs when `id` changes


  const getStatusColor = (status: Module['status']) => {
    switch (status) {
      case 'ongoing':
        return { bg: '#EEF4FF', color: '#3538CD' };
      case 'finished':
        return { bg: '#ECFDF3', color: '#027A48' };
      default:
        return { bg: '#FFFAEB', color: '#B54708' };
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSimulationClick = (simulation: Simulation) => {
    navigate(`/simulation/${simulation.simulation_id}/attempt`);
  };

  const filteredModules = trainingPlan?.modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!trainingPlan) {
    return (
      <DashboardContent>
        <Container>
          <Typography>Loading...</Typography>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container>
        <Stack spacing={4} sx={{ py: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Link 
              to="/training" 
              style={{ textDecoration: 'none' }}
            >
              <Typography variant="h4" color="text.secondary">
                Training Plan
              </Typography>
            </Link>
            <Typography variant="h4" color="text.secondary">/</Typography>
            <Typography variant="h4">{trainingPlan.name}</Typography>
          </Stack>

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <TextField
                placeholder="Search"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ maxWidth: 300 }}
              />
              <Stack direction="row" spacing={1}>
                <IconButton>
                  <FilterListIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton>
                  <SortIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Stack>

            <Paper variant="outlined">
              <Grid container sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Module</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2" color="text.secondary">No. of Sims</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" color="text.secondary">ID No.</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" color="text.secondary">Assignment</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2" color="text.secondary">Score</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                </Grid>
              </Grid>

              {filteredModules.map((module) => (
                <React.Fragment key={module.id}>
                  <Grid
                    container
                    sx={{
                      p: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleModule(module.id)}
                  >
                    <Grid item xs={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton size="small">
                          <ExpandMoreIcon 
                            sx={{ 
                              transform: expandedModules[module.id] ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s'
                            }} 
                          />
                        </IconButton>
                        <Typography>{module.name}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography>{module.total_simulations} Sims</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>{module.id}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>Module Assignment</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography
                        sx={{
                          color: module.average_score >= 80 ? 'success.main' :
                            module.average_score >= 60 ? 'warning.main' : 'error.main'
                        }}
                      >
                        {module.average_score}%
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>{module.due_date || 'No due date'}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Chip
                        label={module.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(module.status).bg,
                          color: getStatusColor(module.status).color,
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Simulations List */}
                  {expandedModules[module.id] && module.simulations.map((sim) => (
                    <Grid
                      container
                      key={sim.simulation_id}
                      sx={{
                        p: 2,
                        pl: 6,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'grey.50',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent module toggle
                        handleSimulationClick(sim);
                      }}
                    >
                      <Grid item xs={3}>
                        <Typography variant="body2">{sim.name}</Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography variant="body2">-</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">{sim.simulation_id}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">Simulation Task</Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: sim.highest_attempt_score && sim.highest_attempt_score >= 80 ? 'success.main' :
                              sim.highest_attempt_score && sim.highest_attempt_score >= 60 ? 'warning.main' : 'error.main'
                          }}
                        >
                          {sim.highest_attempt_score ? `${sim.highest_attempt_score}%` : 'NA'}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">{sim.due_date || 'No due date'}</Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Chip
                          label={sim.status.replace('_', ' ')}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(sim.status).bg,
                            color: getStatusColor(sim.status).color,
                          }}
                        />
                      </Grid>
                    </Grid>
                  ))}
                </React.Fragment>
              ))}
            </Paper>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Rows per page:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(e.target.value)}
                  size="small"
                  sx={{ minWidth: 80 }}
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="20">20</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="100">100</MenuItem>
                </Select>
              </Stack>
              <Pagination
                count={Math.ceil(filteredModules.length / parseInt(rowsPerPage))}
                shape="rounded"
                size="small"
              />
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </DashboardContent>
  );
};

export default TrainingPlanDetailsPage;