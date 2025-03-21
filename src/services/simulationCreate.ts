import axios from 'axios';

export type CreateSimulationPayload = {
  user_id: string;
  name: string;
  division_id: string;
  department_id: string;
  type: 'audio' | 'chat' | 'visual-audio' | 'visual-chat' | 'visual';
  script: Array<{
    script_sentence: string;
    role: string;
    keywords?: string[];
  }>;
  tags: string[];
};

export type CreateSimulationResponse = {
  id: string;
  status: string;
  prompt: string;
};

export const createSimulation = async (payload: CreateSimulationPayload): Promise<CreateSimulationResponse> => {
  try {
    const response = await axios.post('/api/simulations/create', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating simulation:', error);
    throw error;
  }
};