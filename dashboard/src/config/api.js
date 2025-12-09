// Configuração da API - usa variável de ambiente ou fallback para localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  analytics: `${API_BASE_URL}/api/analytics`,
  config: `${API_BASE_URL}/api/config`,
  expenses: `${API_BASE_URL}/api/expenses`,
  health: `${API_BASE_URL}/api/health`,
};
