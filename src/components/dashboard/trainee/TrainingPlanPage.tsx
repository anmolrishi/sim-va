import React from 'react';
import { Stack, Typography, Container } from '@mui/material';
import Layout from '../../layout/Layout';
import DashboardContent from '../DashboardContent';
import StatsGrid from './StatsGrid';
import TrainingPlanTable from './TrainingPlanTable';

const TrainingPlanPage = () => {

  const plans: TrainingPlan[] = [
  {
    "id": "45893",
    "name": "Advanced Leadership Training",
    "total_modules": 3,
    "total_simulations": 5,
    "est_time": 90,
    "average_sim_score": 86,
    "completion_percentage": 92,
    "due_date": "2024-12-25",
    "status": "ongoing"
  },
  {
    "id": "45790",
    "name": "Project Management Basics",
    "total_modules": 2,
    "total_simulations": 3,
    "est_time": 60,
    "average_sim_score": 90,
    "completion_percentage": 0,
    "due_date": "2025-01-25",
    "status": "not_started"
  },
  {
    "id": "45791",
    "name": "Technical Writing Workshop",
    "total_modules": 4,
    "total_simulations": 6,
    "est_time": 120,
    "average_sim_score": 56,
    "completion_percentage": 10,
    "due_date": "2024-12-25",
    "status": "ongoing"
  },
  {
    "id": "45792",
    "name": "Cybersecurity Awareness",
    "total_modules": 5,
    "total_simulations": 8,
    "est_time": 150,
    "average_sim_score": 86,
    "completion_percentage": 100,
    "due_date": "2024-12-25",
    "status": "finished"
  }
];
  
  return (
    
      <DashboardContent>
        <Container>
          <Stack spacing={4} sx={{ py: 4 }}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight="medium">
                Training Plan
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor your score and progress on your assigned training plans
              </Typography>
            </Stack>
            <StatsGrid />
            <TrainingPlanTable trainingPlans={plans} />            
          </Stack>
        </Container>
      </DashboardContent>
    
  );
};

export default TrainingPlanPage;