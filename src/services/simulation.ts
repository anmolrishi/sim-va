import axios from 'axios';

export type SimulationResponse = {
  id: string;
  status: string;
  prompt: string;
};

export type SimulationPayload = {
  user_id: string;
  name: string;
  division_id: string;
  department_id: string;
  type: string;
  tags: string[];
  status: string;
  lvl1: {
    is_enabled: boolean;
    enable_practice: boolean;
    hide_agent_script: boolean;
    hide_customer_script: boolean;
    hide_keyword_scores: boolean;
    hide_sentiment_scores: boolean;
    hide_highlights: boolean;
    hide_coaching_tips: boolean;
    enable_post_simulation_survey: boolean;
    ai_powered_pauses_and_feedback: boolean;
  };
  lvl2: {
    is_enabled: boolean;
  };
  lvl3: {
    is_enabled: boolean;
  };
  estimated_time_to_attempt_in_mins: number;
  key_objectives: string[];
  overview_video: string;
  quick_tips: string[];
  voice_id: string;
  language: string;
  mood: string;
  voice_speed: string;
  prompt: string;
  simulation_completion_repetition: number;
  simulation_max_repetition: number;
  final_simulation_score_criteria: string;
  simulation_scoring_metrics: {
    is_enabled: boolean;
    keyword_score: number;
    click_score: number;
  };
  sim_practice: {
    is_unlimited: boolean;
    pre_requisite_limit: number;
  };
  is_locked: boolean;
  version: number;
  script: Array<{
    script_sentence: string;
    role: string;
    keywords?: string[];
  }>;
};

export const publishSimulation = async (
  simulationId: string,
  payload: SimulationPayload
): Promise<SimulationResponse> => {
  try {
    const response = await axios.put(
      `/api/simulations/${simulationId}/update`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error publishing simulation:', error);
    throw error;
  }
};