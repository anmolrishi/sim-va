import axios from 'axios';
import { ENDPOINTS } from '../config/constants';
import { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

const api = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(ENDPOINTS.LOGIN, credentials);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post(ENDPOINTS.REGISTER, data);
    return response.data;
  },
};

export default api;