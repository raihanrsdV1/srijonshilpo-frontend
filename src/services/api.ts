import axios from 'axios'

export const api = axios.create({
  // Base URL is relative; Vite devServer proxy will forward /api/* to the target
  baseURL: ''
})

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})
