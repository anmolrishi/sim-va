import axios from 'axios';

export interface TrainingPlan {
  id: string;
  name: string;
  tags: string[];
  added_object: Array<{
    type: 'module' | 'simulation';
    id: string;
  }>;
  created_by: string;
  created_at: string;
  last_modified_by: string;
  last_modified_at: string;
  estimated_time: number;
}

export interface CreateTrainingPlanResponse {
  id: string;
  status: string;
}

export interface CreateTrainingPlanPayload {
  user_id: string;
  training_plan_name: string;
  tags: string[];
  added_object: Array<{
    type: 'module' | 'simulation';
    id: string;
  }>;
}

export const fetchTrainingPlans = async (userId: string): Promise<TrainingPlan[]> => {
  try {
    const response = await axios.post('/api/training-plans/fetch', {
      user_id: userId
    });
    return response.data.training_plans;
  } catch (error) {
    console.error('Error fetching training plans:', error);
    throw error;
  }
};

export const createTrainingPlan = async (payload: CreateTrainingPlanPayload): Promise<CreateTrainingPlanResponse> => {
  try {
    const response = await axios.post('/api/training-plans/create', {
      user_id: payload.user_id,
      training_plan_name: payload.training_plan_name,
      tags: payload.tags,
      added_object: payload.added_object
    });
    return response.data;
  } catch (error) {
    console.error('Error creating training plan:', error);
    throw error;
  }
};