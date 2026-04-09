import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRiskTrend: () => api.get('/dashboard/risk-trend'),
  getRiskDistribution: () => api.get('/dashboard/risk-distribution'),
  getHighRiskEmployees: () => api.get('/dashboard/high-risk-employees'),
}

// Email Analyzer
export const analyzerAPI = {
  analyze: (emailContent, mode = 'enterprise') =>
    api.post('/analyze', { email_content: emailContent, mode }),
}

// Simulations
export const simulationsAPI = {
  generate: (data) => api.post('/simulations/generate', data),
  list: () => api.get('/simulations'),
  send: (data) => api.post('/simulations/send', data),
  interact: (data) => api.post('/simulations/interact', data),
  getResults: (id) => api.get(`/simulations/results/${id}`),
}

// Training
export const trainingAPI = {
  generate: (data) => api.post('/training/generate', data),
  list: () => api.get('/training'),
  listAll: () => api.get('/training/all'),
  complete: (id) => api.post(`/training/${id}/complete`),
  getStats: () => api.get('/training/stats'),
}

// Threat Reports
export const threatsAPI = {
  submit: (data) => api.post('/threat-reports', data),
  list: () => api.get('/threat-reports'),
  getStats: () => api.get('/threat-reports/stats'),
  getCategories: () => api.get('/threat-reports/categories'),
  analyze: (id) => api.get(`/threat-reports/${id}/analyze`),
}

// Users
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  list: () => api.get('/users'),
  getRisk: (id) => api.get(`/users/${id}/risk`),
  getAllRisk: () => api.get('/users/risk-overview'),
  evaluateUser: (id) => api.get(`/users/${id}/evaluate`),
}

// Bulk Email Analyzer
export const bulkAnalyzerAPI = {
  analyze: (emails) => api.post('/analyze/bulk', { emails }),
  history: () => api.get('/analyze/bulk/history'),
  downloadReport: () => api.get('/analyze/bulk/report', { responseType: 'blob' }),
}

// AI Campaign Generator
export const campaignAPI = {
  generate: (data) => api.post('/ai/generate-campaign', data),
  list: () => api.get('/ai/campaigns'),
}

// AI Risk Prediction
export const riskPredictionAPI = {
  predict: (data) => api.post('/ai/predict-risk', data),
}

export const socAPI = {
  generateLogs: (data) => api.post('/generate-logs', data),
  analyzeLog: (log) => api.post('/analyze-log', log),
  analyzeBatch: (logs) => api.post('/analyze-batch', { logs }),
}

export default api
