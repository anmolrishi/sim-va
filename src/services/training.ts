import axios from 'axios';
import { TrainingData } from '../types/training';

export const fetchTrainingData = async (userId: string): Promise<TrainingData> => {
  try {
    const response = await axios.post('/api/training-data/fetch', {
      id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching training data:', error);
    throw error;
  }
};