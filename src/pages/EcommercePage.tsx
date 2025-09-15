import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ecommerceService } from '../services/api'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stockQuantity: number
  isActive: boolean
  categoryName?: string
  imageUrls?: string[]
}

interface Category {
  id: number
  name: string
  description: string
  isActive: boolean
  productCount: number
}

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  lowStockProducts: number
  activeProducts: number
  totalValue: number
}

export default function EcommercePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<{username?: string; email?: string} | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [websiteId, setWebsiteId] = useState('default')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    stockQuantity: 0,
    categoryId: 0,
    websiteId: 'default'
  })

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    websiteId: 'default'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (!token || !savedUser) {
      navigate('/login')
      return
    }

    try {
      setUser(JSON.parse(savedUser))
      loadDashboardData()
    } catch (error) {
      console.error('Failed to parse user data:', error)
      navigate('/login')
    }
  }, [navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboard, productsData, categoriesData] = await Promise.all([
        ecommerceService.getDashboard(websiteId),
        ecommerceService.getProducts(websiteId, 0, 50),
        ecommerceService.getCategories(websiteId)
      ])
      
      setDashboardStats(dashboard.stats)
      setProducts(productsData.content || productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      await ecommerceService.createProduct(newProduct)
      setShowProductModal(false)
      setNewProduct({
        name: '',
        description: '',
        sku: '',
        price: 0,
        stockQuantity: 0,
        categoryId: 0,
        websiteId: 'default'
      })
      loadDashboardData()
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }

  const handleCreateCategory = async () => {
    try {
      await ecommerceService.createCategory(newCategory)
      setShowCategoryModal(false)
      setNewCategory({
        name: '',
        description: '',
        websiteId: 'default'
      })
      loadDashboardData()
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await ecommerceService.deleteProduct(id, websiteId)
        loadDashboardData()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const handleUpdateStock = async (id: number, newStock: number) => {
    try {
      await ecommerceService.updateProductStock(id, websiteId, newStock)
      loadDashboardData()
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      {/* Inject animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .glassmorphism-header {
          background: rgba(15, 15, 35, 0.85) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }
        
        .glassmorphism-card {
          background: rgba(15, 15, 35, 0.8) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
      {/* Header */}
      <header className="glassmorphism-header relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Srijon Shilpo E-commerce</h1>
              <div className="ml-4 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-sm">
                Website: {websiteId}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Welcome, {user?.username}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['dashboard', 'products', 'categories', 'inventory'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="glassmorphism-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-400">Total Products</h3>
                <p className="text-3xl font-bold text-white">{dashboardStats?.totalProducts || 0}</p>
              </div>
              <div className="glassmorphism-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-400">Categories</h3>
                <p className="text-3xl font-bold text-white">{dashboardStats?.totalCategories || 0}</p>
              </div>
              <div className="glassmorphism-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-400">Active Products</h3>
                <p className="text-3xl font-bold text-green-400">{dashboardStats?.activeProducts || 0}</p>
              </div>
              <div className="glassmorphism-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-400">Low Stock</h3>
                <p className="text-3xl font-bold text-red-400">{dashboardStats?.lowStockProducts || 0}</p>
              </div>
              <div className="glassmorphism-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-400">Total Value</h3>
                <p className="text-3xl font-bold text-white">৳{dashboardStats?.totalValue || 0}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glassmorphism-card p-6 rounded-2xl">
              <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowProductModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-medium">Add Product</div>
                </button>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">📁</div>
                  <div className="font-medium">Add Category</div>
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">Manage Inventory</div>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-medium">View Products</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <button
                onClick={() => setShowProductModal(true)}
                className="btn-primary"
              >
                Add Product
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-sm text-gray-500">Stock: {product.stockQuantity}</span>
                            <span className="text-lg font-bold text-gray-900">৳{product.price}</span>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>SKU: {product.sku}</span>
                          {product.categoryName && <span>Category: {product.categoryName}</span>}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <input
                          type="number"
                          value={product.stockQuantity}
                          onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="btn-primary"
              >
                Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{category.productCount} products</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {products.filter(p => p.stockQuantity <= 10).map((product) => (
                  <li key={product.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          product.stockQuantity === 0 
                            ? 'bg-red-100 text-red-800' 
                            : product.stockQuantity <= 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} in stock`}
                        </span>
                        <input
                          type="number"
                          value={product.stockQuantity}
                          onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="form-input w-full"
              />
              <input
                type="text"
                placeholder="SKU"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                className="form-input w-full"
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="form-input w-full h-24"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                className="form-input w-full"
              />
              <input
                type="number"
                placeholder="Initial Stock"
                value={newProduct.stockQuantity}
                onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value)})}
                className="form-input w-full"
              />
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})}
                className="form-input w-full"
              >
                <option value={0}>Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="btn-primary"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="form-input w-full"
              />
              <textarea
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                className="form-input w-full h-24"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="btn-primary"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
