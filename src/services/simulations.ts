import axios from 'axios';

export interface Simulation {
  id: string;
  sim_name: string;
  version: string;
  sim_type: string;
  status: string;
  tags: string[];
  est_time: string;
  last_modified: string;
  modified_by: string;
  created_on: string;
  created_by: string;
  islocked: boolean;
}

export const fetchSimulations = async (userId: string): Promise<Simulation[]> => {
  try {
    const response = await axios.post('/api/simulations/fetch', {
      user_id: userId
    });
    return response.data.simulations;
  } catch (error) {
    console.error('Error fetching simulations:', error);
    throw error;
  }
};