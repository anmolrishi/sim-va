import axios from 'axios';

export interface Assignment {
  id: string;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  team_id: string[];
  trainee_id: string[];
  created_by: string;
  created_at: string;
  last_modified_by: string;
  last_modified_at: string;
  status: string;
}

export interface CreateAssignmentPayload {
  user_id: string;
  name: string;
  type: 'TrainingPlan' | 'Module' | 'Simulation';
  start_date: string;
  end_date: string;
  team_id: string[];
  trainee_id: string[];
}

export interface CreateAssignmentResponse {
  id: string;
  status: string;
}

export const fetchAssignments = async (): Promise<Assignment[]> => {
  try {
    const response = await axios.get('/api/fetch-assignments');
    return response.data.assignments;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

export const createAssignment = async (payload: CreateAssignmentPayload): Promise<CreateAssignmentResponse> => {
  try {
    const response = await axios.post('/api/create-assignment', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};