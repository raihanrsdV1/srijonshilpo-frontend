import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ecommerceService, builderService, getImageUrl } from '../services/api'
import ImageUpload from '../components/ImageUpload'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stockQuantity: number
  isActive: boolean
  categoryName?: string
  imageUrls?: string[]
  description?: string
  shortDescription?: string
  categoryId?: number
}

interface Category {
  id: number
  name: string
  description: string
  isActive: boolean
  productCount: number
}

interface StoreStats {
  totalProducts: number
  totalCategories: number
  lowStockProducts: number
  activeProducts: number
  totalValue: number
}

interface Store {
  id: number
  name: string
  description: string
  slug: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function StoreManagementPage() {
  const navigate = useNavigate()
  const { storeId } = useParams<{ storeId: string }>()
  const [user, setUser] = useState<{username?: string; email?: string} | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    stockQuantity: 0,
    categoryId: 0,
    websiteId: storeId || 'default',
    active: true,
    imageUrls: [] as string[]
  })

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    websiteId: storeId || 'default',
    active: true
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
      if (storeId) {
        loadStoreData()
      }
    } catch (error) {
      console.error('Failed to parse user data:', error)
      navigate('/login')
    }
  }, [navigate, storeId])

  const calculateStats = (products: Product[], categories: Category[]) => {
    const totalProducts = products.length
    const totalCategories = categories.length
    const activeProducts = products.filter(p => p.isActive).length
    const lowStockProducts = products.filter(p => p.stockQuantity <= 5).length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
    
    return {
      totalProducts,
      totalCategories,
      activeProducts,
      lowStockProducts,
      totalValue: Math.round(totalValue * 100) / 100 // Round to 2 decimal places
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('BDT', '৳')
  }

  const loadStoreData = async () => {
    if (!storeId) return
    
    try {
      setLoading(true)
      
      // Load store info from builder service
      const storeInfo = await builderService.getProject(parseInt(storeId))
      setStore(storeInfo)
      
      // Load e-commerce data using store slug as websiteId
      const websiteId = storeInfo.slug || storeId
      setNewProduct(prev => ({ ...prev, websiteId }))
      setNewCategory(prev => ({ ...prev, websiteId }))
      
      const [productsData, categoriesData] = await Promise.all([
        ecommerceService.getProducts(websiteId, 0, 50).catch(() => ({ content: [] })),
        ecommerceService.getCategories(websiteId).catch(() => [])
      ])
      
      const products = productsData.content || productsData
      const categories = categoriesData
      
      // Calculate stats from actual data
      const stats = calculateStats(products, categories)
      
      setStoreStats(stats)
      setProducts(products)
      setCategories(categories)
    } catch (error) {
      console.error('Failed to load store data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      // Validate required fields
      if (!newProduct.name.trim()) {
        alert('Product name is required')
        return
      }
      
      if (!newProduct.sku.trim()) {
        alert('SKU is required')
        return
      }
      
      if (!newProduct.price || newProduct.price <= 0) {
        alert('Price is required and must be greater than 0')
        return
      }
      
      // Add default image if none provided and handle category ID
      const productData = {
        ...newProduct,
        imageUrls: newProduct.imageUrls.length > 0 ? newProduct.imageUrls : [getDefaultProductImage()],
        categoryId: newProduct.categoryId === 0 ? null : newProduct.categoryId
      }
      
      console.log('Creating product with data:', productData)
      
      await ecommerceService.createProduct(productData)
      setShowProductModal(false)
      resetProductForm()
      await loadStoreData() // Reload to get updated stats
    } catch (error: any) {
      console.error('Failed to create product:', error)
      if (error.response) {
        console.error('Server response:', error.response.data)
        console.error('Status:', error.response.status)
        console.error('Headers:', error.response.headers)
      }
      alert('Failed to create product. Please check the console for details.')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId || 0,
      websiteId: store?.slug || storeId || 'default',
      active: product.isActive,
      imageUrls: product.imageUrls || []
    })
    setShowProductModal(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    
    try {
      // Validate required fields
      if (!newProduct.name.trim()) {
        alert('Product name is required')
        return
      }
      
      if (!newProduct.sku.trim()) {
        alert('SKU is required')
        return
      }
      
      if (!newProduct.price || newProduct.price <= 0) {
        alert('Price is required and must be greater than 0')
        return
      }
      
      const productData = {
        ...newProduct,
        categoryId: newProduct.categoryId === 0 ? null : newProduct.categoryId
      }
      
      await ecommerceService.updateProduct(editingProduct.id, productData)
      setShowProductModal(false)
      setEditingProduct(null)
      resetProductForm()
      await loadStoreData() // Reload to get updated stats
    } catch (error: any) {
      console.error('Failed to update product:', error)
      if (error.response) {
        console.error('Server response:', error.response.data)
        console.error('Status:', error.response.status)
      }
      alert('Failed to update product. Please check the console for details.')
    }
  }

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      description: '',
      sku: '',
      price: 0,
      stockQuantity: 0,
      categoryId: 0,
      websiteId: store?.slug || storeId || 'default',
      active: true,
      imageUrls: []
    })
  }

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      setNewProduct({
        ...newProduct,
        imageUrls: [...newProduct.imageUrls, url.trim()]
      })
    }
  }

  const handleRemoveImageUrl = (index: number) => {
    setNewProduct({
      ...newProduct,
      imageUrls: newProduct.imageUrls.filter((_, i) => i !== index)
    })
  }

  const handleImagesChange = (images: string[]) => {
    setNewProduct({
      ...newProduct,
      imageUrls: images
    })
  }

  const getDefaultProductImage = () => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    ]
    return defaultImages[Math.floor(Math.random() * defaultImages.length)]
  }

  const getProductImageUrl = (product: Product) => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      return getImageUrl(product.imageUrls[0])
    }
    return getDefaultProductImage()
  }

  const handleCreateCategory = async () => {
    try {
      await ecommerceService.createCategory(newCategory)
      setShowCategoryModal(false)
      setNewCategory({
        name: '',
        description: '',
        websiteId: store?.slug || storeId || 'default',
        active: true
      })
      await loadStoreData() // Reload to get updated stats
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleCloseProductModal = () => {
    setShowProductModal(false)
    setEditingProduct(null)
    resetProductForm()
  }

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await ecommerceService.deleteProduct(id, store?.slug || storeId || 'default')
        await loadStoreData() // Reload to get updated stats
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const handleUpdateStock = async (id: number, newStock: number) => {
    try {
      await ecommerceService.updateProductStock(id, store?.slug || storeId || 'default', newStock)
      await loadStoreData() // Reload to get updated stats
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const viewLiveStore = () => {
    if (store?.slug) {
      const url = `http://localhost:8083/public/sites/${store.slug}/render`
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Store Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <span>🏪</span>
                  <span>{store.name}</span>
                </h1>
                <p className="text-sm text-gray-500">Store ID: {store.slug}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                store.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {store.isPublished ? 'Published' : 'Draft'}
              </span>
              <button
                onClick={() => navigate(`/builder/${store.id}`)}
                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Edit Design
              </button>
              {store.isPublished && (
                <button
                  onClick={viewLiveStore}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  View Live ↗
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'products', 'categories', 'inventory', 'orders'].map((tab) => (
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Store Overview</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowProductModal(true)}
                  className="btn-primary"
                >
                  Add Product
                </button>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Add Category
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-blue-500">
                <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                <p className="text-3xl font-bold text-gray-900">{storeStats?.totalProducts || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-green-500">
                <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                <p className="text-3xl font-bold text-gray-900">{storeStats?.totalCategories || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-yellow-500">
                <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
                <p className="text-3xl font-bold text-green-600">{storeStats?.activeProducts || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-red-500">
                <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
                <p className="text-3xl font-bold text-red-600">{storeStats?.lowStockProducts || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-l-purple-500">
                <h3 className="text-sm font-medium text-gray-500">Store Value</h3>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(storeStats?.totalValue || 0)}</p>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
              </div>
              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-300 text-4xl mb-4">📦</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h4>
                    <p className="text-gray-600 mb-4">Add your first product to start building your store.</p>
                    <button
                      onClick={() => setShowProductModal(true)}
                      className="btn-primary"
                    >
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={getProductImageUrl(product)} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = getDefaultProductImage()
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-500">SKU: {product.sku} • Stock: {product.stockQuantity}</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</div>
                      </div>
                    ))}
                    {products.length > 5 && (
                      <button
                        onClick={() => setActiveTab('products')}
                        className="w-full py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        View All Products ({products.length})
                      </button>
                    )}
                  </div>
                )}
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
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={getProductImageUrl(product)} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = getDefaultProductImage()
                            }}
                          />
                        </div>
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
                              <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>SKU: {product.sku}</span>
                            {product.categoryName && <span>Category: {product.categoryName}</span>}
                          </div>
                          {product.description && (
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                          )}
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
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 text-sm"
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

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-300 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management Coming Soon</h3>
              <p className="text-gray-600">Order tracking and management features will be available in a future update.</p>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROD-001"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="form-input w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter product description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="form-input w-full h-24"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.01"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    className="form-input w-full"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProduct.stockQuantity || ''}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value) || 0})}
                    className="form-input w-full"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
              </div>

              {/* Image Management Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <ImageUpload
                  images={newProduct.imageUrls}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Status</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="product-active"
                    checked={newProduct.active}
                    onChange={(e) => setNewProduct({...newProduct, active: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="product-active" className="text-sm font-medium text-gray-700">
                    Product is active and visible to customers
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseProductModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                className="btn-primary"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="category-active"
                  checked={newCategory.active}
                  onChange={(e) => setNewCategory({...newCategory, active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="category-active" className="text-sm font-medium text-gray-700">
                  Category is active
                </label>
              </div>
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
