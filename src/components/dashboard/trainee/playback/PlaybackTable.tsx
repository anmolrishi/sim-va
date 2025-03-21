import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Grid,
  Paper,
  TextField,
  IconButton,
  Typography,
  Chip,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

interface SimulationRecord {
  id: string;
  trainingPlan: string;
  module: string;
  simId: string;
  simName: string;
  simType: string;
  level: string;
  score: string;
  status: string;
}

const simulationData: SimulationRecord[] = [
  {
    id: "1",
    trainingPlan: "New Training Plan 01",
    module: "Module_name_01",
    simId: "82840",
    simName: "Humana_MS_PCP Change",
    simType: "Visual-Audio",
    level: "Lvl 02",
    score: "56%",
    status: "Finished"
  },
  {
    id: "2",
    trainingPlan: "New Training Plan 01",
    module: "Module_name_01",
    simId: "82841",
    simName: "Humana_MS_PCP Change",
    simType: "Visual-Audio",
    level: "Lvl 02",
    score: "56%",
    status: "Finished"
  },
  {
    id: "3",
    trainingPlan: "New Training Plan 01",
    module: "Module_name_01",
    simId: "82842",
    simName: "Humana_MS_PCP Change",
    simType: "Visual-Audio",
    level: "Lvl 02",
    score: "56%",
    status: "Finished"
  },
  {
    id: "4",
    trainingPlan: "New Training Plan 01",
    module: "Module_name_01",
    simId: "82843",
    simName: "Humana_MS_PCP Change",
    simType: "Visual-Audio",
    level: "Lvl 02",
    score: "56%",
    status: "Finished"
  }
];

const PlaybackTable = () => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState('50');

  const handleRowClick = (id: string) => {
    navigate(`/playback/${id}`);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TextField
          placeholder="Search"
          size="small"
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
          <Grid item xs={2}>
            <Typography variant="subtitle2" color="text.secondary">Training Plan & Module</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="subtitle2" color="text.secondary">Sim ID</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle2" color="text.secondary">Sim Name</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" color="text.secondary">Sim Type</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="subtitle2" color="text.secondary">Level</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="subtitle2" color="text.secondary">Score</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
          </Grid>
        </Grid>

        {simulationData.map((sim) => (
          <Grid
            key={sim.id}
            container
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer'
              }
            }}
            onClick={() => handleRowClick(sim.id)}
            alignItems="center"
          >
            <Grid item xs={2}>
              <Stack>
                <Typography variant="body2" fontWeight="medium">{sim.trainingPlan}</Typography>
                <Typography variant="caption" color="text.secondary">{sim.module}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2">{sim.simId}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">{sim.simName}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Chip
                label={sim.simType}
                size="small"
                sx={{
                  bgcolor: 'purple.50',
                  color: 'purple.main',
                }}
              />
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2">{sim.level}</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography
                variant="body2"
                color={
                  parseInt(sim.score) >= 80 ? "success.main" :
                  parseInt(sim.score) >= 60 ? "warning.main" :
                  "error.main"
                }
              >
                {sim.score}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Chip
                label={sim.status}
                size="small"
                sx={{
                  bgcolor: 'success.50',
                  color: 'success.main',
                }}
              />
            </Grid>
          </Grid>
        ))}
      </Paper>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 2 }}
      >
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
          count={10}
          shape="rounded"
          size="small"
        />
      </Stack>
    </Stack>
  );
};

export default PlaybackTable;