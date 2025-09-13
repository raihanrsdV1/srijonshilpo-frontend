import axios from 'axios'

// API Configuration - Use proxy paths in development
const AUTH_SERVICE_URL = '/api/auth'
const BUILDER_SERVICE_URL = '/api/builder'
const ECOMMERCE_SERVICE_URL = 'http://localhost:8082'

export const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL
})

export const builderApi = axios.create({
  baseURL: BUILDER_SERVICE_URL
})

export const ecommerceApi = axios.create({
  baseURL: ECOMMERCE_SERVICE_URL
})

// Default API (builder service)
export const api = builderApi

// Attach token and user ID automatically if present
const attachAuthHeaders = (config: any) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  if (user.username) {
    config.headers = config.headers || {}
    config.headers['X-User-ID'] = user.username
  }
  
  return config
}

// Apply auth headers to all APIs
authApi.interceptors.request.use(attachAuthHeaders)
builderApi.interceptors.request.use(attachAuthHeaders)
ecommerceApi.interceptors.request.use(attachAuthHeaders)

// Auth Service Functions
export const authService = {
  login: async (username: string, password: string) => {
    const response = await authApi.post('/login', { username, password })
    return response.data
  },
  
  register: async (username: string, email: string, password: string) => {
    const response = await authApi.post('/register', { username, email, password })
    return response.data
  },
  
  validateToken: async (token: string) => {
    const response = await authApi.post('/validate', { token })
    return response.data
  }
}

// Builder Service Functions
export const builderService = {
  getProjects: async () => {
    const response = await builderApi.get('/projects')
    return response.data
  },
  
  getUserProjects: async () => {
    const response = await builderApi.get('/projects')
    return response.data
  },
  
  getProject: async (id: number) => {
    const response = await builderApi.get(`/projects/${id}`)
    return response.data
  },
  
  createProject: async (name: string, description: string) => {
    const response = await builderApi.post('/projects', { name, description })
    return response.data
  },
  
  updateProject: async (id: number, data: any) => {
    const response = await builderApi.put(`/projects/${id}`, data)
    return response.data
  },

  saveProject: async (id: number, data: any) => {
    const response = await builderApi.post(`/projects/${id}/save`, data)
    return response.data
  },
  
  publishProject: async (id: number) => {
    const response = await builderApi.post(`/projects/${id}/publish`)
    return response.data
  },
  
  deleteProject: async (id: number) => {
    await builderApi.delete(`/projects/${id}`)
  },
  
  getPublishedProjects: async () => {
    const response = await builderApi.get('/public/projects')
    return response.data
  }
}
