import axios from 'axios'

// API Configuration - Use proxy paths in development
const AUTH_SERVICE_URL = '/api/auth'
const BUILDER_SERVICE_URL = '/api/builder'
const ECOMMERCE_SERVICE_URL = '/api/ecommerce'
const FILES_SERVICE_URL = '/api/files'

export const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL
})

export const builderApi = axios.create({
  baseURL: BUILDER_SERVICE_URL
})

export const ecommerceApi = axios.create({
  baseURL: ECOMMERCE_SERVICE_URL
})

export const filesApi = axios.create({
  baseURL: FILES_SERVICE_URL
})

// Helper function to get the full URL for uploaded images
export const getImageUrl = (relativePath: string): string => {
  // If it's already a full URL (http/https), return as is
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  
  // If it's a relative path starting with /api/files, it's from our upload service
  if (relativePath.startsWith('/api/files')) {
    // In development, use the current origin which will go through Vite proxy
    const fullUrl = `${window.location.origin}${relativePath}`
    console.log('Converting image URL:', relativePath, '->', fullUrl)
    return fullUrl
  }
  
  // Otherwise, return as is (for external URLs)
  return relativePath
}

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
filesApi.interceptors.request.use(attachAuthHeaders)

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

// E-commerce Service Functions
export const ecommerceService = {
  // Dashboard
  getDashboard: async (websiteId: string) => {
    const response = await ecommerceApi.get(`/dashboard/${websiteId}`)
    return response.data
  },

  // Categories
  getCategories: async (websiteId: string) => {
    const response = await ecommerceApi.get(`/categories?websiteId=${websiteId}`)
    return response.data
  },

  createCategory: async (categoryData: any) => {
    const response = await ecommerceApi.post('/categories', categoryData)
    return response.data
  },

  updateCategory: async (id: number, categoryData: any) => {
    const response = await ecommerceApi.put(`/categories/${id}`, categoryData)
    return response.data
  },

  deleteCategory: async (id: number, websiteId: string) => {
    await ecommerceApi.delete(`/categories/${id}?websiteId=${websiteId}`)
  },

  // Products
  getProducts: async (websiteId: string, page = 0, size = 10) => {
    const response = await ecommerceApi.get(`/products?websiteId=${websiteId}&page=${page}&size=${size}`)
    return response.data
  },

  getProduct: async (id: number, websiteId: string) => {
    const response = await ecommerceApi.get(`/products/${id}?websiteId=${websiteId}`)
    return response.data
  },

  createProduct: async (productData: any) => {
    const response = await ecommerceApi.post('/products', productData)
    return response.data
  },

  updateProduct: async (id: number, productData: any) => {
    const response = await ecommerceApi.put(`/products/${id}`, productData)
    return response.data
  },

  updateProductStock: async (id: number, websiteId: string, stock: number) => {
    const response = await ecommerceApi.patch(`/products/${id}/stock?websiteId=${websiteId}`, {
      stockQuantity: stock
    })
    return response.data
  },

  deleteProduct: async (id: number, websiteId: string) => {
    await ecommerceApi.delete(`/products/${id}?websiteId=${websiteId}`)
  },

  searchProducts: async (websiteId: string, query: string, page = 0, size = 10) => {
    const response = await ecommerceApi.get(`/products/search?websiteId=${websiteId}&query=${query}&page=${page}&size=${size}`)
    return response.data
  },

  getFeaturedProducts: async (websiteId: string) => {
    const response = await ecommerceApi.get(`/products/featured?websiteId=${websiteId}`)
    return response.data
  },

  getLowStockProducts: async (websiteId: string) => {
    const response = await ecommerceApi.get(`/products/low-stock?websiteId=${websiteId}`)
    return response.data
  },

  // File Upload
  uploadImages: async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response = await filesApi.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteImage: async (userId: string, filename: string) => {
    await filesApi.delete(`/images/${userId}/${filename}`)
  }
}
