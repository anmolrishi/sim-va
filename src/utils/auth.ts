import { User } from '../types/auth';

export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};