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
  totalOrders: number
  pendingOrders: number
  monthlyRevenue: number
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

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  productId: number
  productName: string
  productImage?: string
  quantity: number
  price: number
  total: number
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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed'>('all')

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

  const calculateStats = (products: Product[], categories: Category[], orders: Order[]) => {
    const totalProducts = products.length
    const totalCategories = categories.length
    const activeProducts = products.filter(p => p.isActive).length
    const lowStockProducts = products.filter(p => p.stockQuantity <= 5).length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
    
    // Order statistics
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const monthlyRevenue = orders
      .filter(o => new Date(o.createdAt) >= thisMonth && o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0)
    
    return {
      totalProducts,
      totalCategories,
      activeProducts,
      lowStockProducts,
      totalValue: Math.round(totalValue * 100) / 100,
      totalOrders,
      pendingOrders,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100
    }
  }

  const generateDummyOrders = (): Order[] => {
    const dummyOrders: Order[] = [
      {
        id: 'ORD-001',
        orderNumber: 'SRS-2025-001',
        customerName: 'Ahmed Hassan',
        customerEmail: 'ahmed.hassan@email.com',
        customerPhone: '+88 01711 234567',
        items: [
          {
            id: 'item-1',
            productId: 1,
            productName: 'Handwoven Jamdani Saree',
            productImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400&h=400&fit=crop',
            quantity: 1,
            price: 8500,
            total: 8500
          }
        ],
        total: 8500,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          address: '123 Dhanmondi Road',
          city: 'Dhaka',
          postalCode: '1205',
          country: 'Bangladesh'
        },
        createdAt: '2025-09-15T10:30:00Z',
        updatedAt: '2025-09-15T10:30:00Z'
      },
      {
        id: 'ORD-002',
        orderNumber: 'SRS-2025-002',
        customerName: 'Fatima Rahman',
        customerEmail: 'fatima.r@email.com',
        customerPhone: '+88 01912 345678',
        items: [
          {
            id: 'item-2',
            productId: 2,
            productName: 'Silk Katan Saree',
            quantity: 2,
            price: 6500,
            total: 13000
          },
          {
            id: 'item-3',
            productId: 3,
            productName: 'Cotton Handloom Fabric',
            quantity: 1,
            price: 2500,
            total: 2500
          }
        ],
        total: 15500,
        status: 'confirmed',
        paymentStatus: 'paid',
        shippingAddress: {
          address: '456 Gulshan Avenue',
          city: 'Dhaka',
          postalCode: '1212',
          country: 'Bangladesh'
        },
        createdAt: '2025-09-14T14:20:00Z',
        updatedAt: '2025-09-15T09:15:00Z'
      },
      {
        id: 'ORD-003',
        orderNumber: 'SRS-2025-003',
        customerName: 'Mohammad Karim',
        customerEmail: 'md.karim@email.com',
        items: [
          {
            id: 'item-4',
            productId: 1,
            productName: 'Handwoven Jamdani Saree',
            quantity: 1,
            price: 8500,
            total: 8500
          }
        ],
        total: 8500,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingAddress: {
          address: '789 Chittagong Road',
          city: 'Chittagong',
          postalCode: '4000',
          country: 'Bangladesh'
        },
        createdAt: '2025-09-13T16:45:00Z',
        updatedAt: '2025-09-14T11:30:00Z'
      },
      {
        id: 'ORD-004',
        orderNumber: 'SRS-2025-004',
        customerName: 'Rashida Begum',
        customerEmail: 'rashida.b@email.com',
        items: [
          {
            id: 'item-5',
            productId: 4,
            productName: 'Traditional Nakshi Kantha',
            quantity: 3,
            price: 3500,
            total: 10500
          }
        ],
        total: 10500,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          address: '321 Sylhet City',
          city: 'Sylhet',
          postalCode: '3100',
          country: 'Bangladesh'
        },
        createdAt: '2025-09-12T09:15:00Z',
        updatedAt: '2025-09-13T15:45:00Z'
      },
      {
        id: 'ORD-005',
        orderNumber: 'SRS-2025-005',
        customerName: 'Nasir Ahmed',
        customerEmail: 'nasir.ahmed@email.com',
        items: [
          {
            id: 'item-6',
            productId: 2,
            productName: 'Silk Katan Saree',
            quantity: 1,
            price: 6500,
            total: 6500
          }
        ],
        total: 6500,
        status: 'cancelled',
        paymentStatus: 'refunded',
        shippingAddress: {
          address: '654 Rajshahi Road',
          city: 'Rajshahi',
          postalCode: '6000',
          country: 'Bangladesh'
        },
        createdAt: '2025-09-11T12:30:00Z',
        updatedAt: '2025-09-12T10:15:00Z'
      }
    ]
    return dummyOrders
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('BDT', '৳')
  }

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    )
  }

  const getNextOrderStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      'pending': 'confirmed',
      'confirmed': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered',
      'delivered': null,
      'cancelled': null
    }
    return statusFlow[currentStatus]
  }

  const canAdvanceOrderStatus = (status: Order['status']) => {
    return getNextOrderStatus(status) !== null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleOrderStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      )
    )
  }

  // Computed values
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true
    return order.status === orderFilter
  })

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
      const orders = generateDummyOrders() // Load dummy orders for now
      
      // Calculate stats from actual data
      const stats = calculateStats(products, categories, orders)
      
      setStoreStats(stats)
      setProducts(products)
      setCategories(categories)
      setOrders(orders)
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Modern Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white/50 transition-all"
            >
              ← Back
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🏪</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {store.name}
              </h1>
              <p className="text-sm text-gray-600 font-medium">Store ID: {store.slug}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              store.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {store.isPublished ? 'Published' : 'Draft'}
            </span>
            <button
              onClick={() => navigate(`/builder/${store.id}`)}
              className="bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/90 hover:shadow-lg transform hover:scale-105"
            >
              Edit Design
            </button>
            {store.isPublished && (
              <button
                onClick={viewLiveStore}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                View Live ↗
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 bg-white/70 backdrop-blur-md border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {['overview', 'products', 'categories', 'orders', 'inventory'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 px-4 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
                {tab === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Store Overview
                </h2>
                <p className="text-gray-600 mt-2">Manage your e-commerce store with powerful insights</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  ✨ Add Product
                </button>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                >
                  📁 Add Category
                </button>
              </div>
            </div>
            
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      {storeStats?.totalProducts || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl">📦</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                      {storeStats?.totalCategories || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl">📁</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                      {storeStats?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl">🛒</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Revenue</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                      {formatCurrency(storeStats?.monthlyRevenue || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">✅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Products</p>
                    <p className="text-xl font-bold text-gray-800">{storeStats?.activeProducts || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Low Stock</p>
                    <p className="text-xl font-bold text-gray-800">{storeStats?.lowStockProducts || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">⏳</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <p className="text-xl font-bold text-gray-800">{storeStats?.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">💎</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Store Value</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(storeStats?.totalValue || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Status Chart */}
              <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📊</span>
                  </span>
                  Order Status Distribution
                </h3>
                <div className="space-y-3">
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => {
                    const count = orders.filter(o => o.status === status).length
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0
                    const colors = {
                      pending: 'from-yellow-400 to-orange-400',
                      confirmed: 'from-blue-400 to-blue-500',
                      shipped: 'from-indigo-400 to-purple-400',
                      delivered: 'from-green-400 to-emerald-400',
                      cancelled: 'from-red-400 to-pink-400'
                    }
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[status as keyof typeof colors]}`}></div>
                          <span className="text-sm font-medium capitalize text-gray-700">{status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${colors[status as keyof typeof colors]} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-800 w-8">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">💹</span>
                  </span>
                  Revenue Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <span className="text-sm font-medium text-emerald-700">This Month</span>
                    <span className="text-lg font-bold text-emerald-800">{formatCurrency(storeStats?.monthlyRevenue || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <span className="text-sm font-medium text-blue-700">Total Value</span>
                    <span className="text-lg font-bold text-blue-800">{formatCurrency(storeStats?.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <span className="text-sm font-medium text-purple-700">Avg. Order Value</span>
                    <span className="text-lg font-bold text-purple-800">
                      {formatCurrency(orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg">
              <div className="p-6 border-b border-white/30">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🛍️</span>
                  </span>
                  Recent Products
                </h3>
              </div>
              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl">📦</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Products Yet</h4>
                    <p className="text-gray-500 mb-4">Start building your store by adding your first product</p>
                    <button
                      onClick={() => setShowProductModal(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/70 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
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
                            <h4 className="font-semibold text-gray-800">{product.name}</h4>
                            <p className="text-sm text-gray-500">SKU: {product.sku} • Stock: {product.stockQuantity}</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                    ))}
                    {products.length > 5 && (
                      <button
                        onClick={() => setActiveTab('products')}
                        className="w-full py-3 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium"
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
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Products
                </h2>
                <p className="text-gray-600 mt-2">Manage your product catalog</p>
              </div>
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                ✨ Add Product
              </button>
            </div>

            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-white/30">
                {products.map((product) => (
                  <div key={product.id} className="p-6 hover:bg-white/80 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
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
                            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">Stock: {product.stockQuantity}</span>
                              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">SKU: {product.sku}</span>
                            {product.categoryName && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">Category: {product.categoryName}</span>}
                          </div>
                          {product.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg">{product.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-6 flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={product.stockQuantity}
                            onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 px-3 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Categories
                </h2>
                <p className="text-gray-600 mt-2">Organize your products into categories</p>
              </div>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                📁 Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="group bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/80">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-xl">📁</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                      {category.productCount} products
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      View Products
                    </button>
                  </div>
                </div>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">📁</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Categories Yet</h4>
                  <p className="text-gray-500 mb-4">Create categories to organize your products</p>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Create First Category
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Inventory Management
              </h2>
              <p className="text-gray-600 mt-2">Monitor and manage your product stock levels</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-white/30">
                {products.filter(p => p.stockQuantity <= 10).map((product) => (
                  <div key={product.id} className="p-6 hover:bg-white/80 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
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
                          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                          <p className="text-sm text-gray-500 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg inline-block">SKU: {product.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          product.stockQuantity === 0 
                            ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' 
                            : product.stockQuantity <= 5
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-800 border border-orange-300'
                            : 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300'
                        }`}>
                          {product.stockQuantity === 0 ? '❌ Out of Stock' : `📦 ${product.stockQuantity} in stock`}
                        </span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={product.stockQuantity}
                            onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleUpdateStock(product.id, product.stockQuantity + 10)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg hover:shadow-md transition-all duration-300 text-sm font-medium"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {products.filter(p => p.stockQuantity <= 10).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl">✅</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">All Products Well Stocked</h4>
                    <p className="text-gray-500">No products are running low on inventory</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Order Management
                </h2>
                <p className="text-gray-600 mt-2">Track and manage customer orders</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    orderFilter === 'all' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-white/90'
                  }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    orderFilter === 'pending' 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                      : 'bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-white/90'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setOrderFilter('confirmed')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    orderFilter === 'confirmed' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                      : 'bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-white/90'
                  }`}
                >
                  Confirmed
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/30">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/80 transition-all duration-300">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatOrderDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                            >
                              View
                            </button>
                            {canAdvanceOrderStatus(order.status) && (
                              <button
                                onClick={() => {
                                  const nextStatus = getNextOrderStatus(order.status)
                                  if (nextStatus) {
                                    handleOrderStatusUpdate(order.id, nextStatus)
                                  }
                                }}
                                className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                              >
                                {getNextOrderStatus(order.status)}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">📋</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Orders Found</h4>
                  <p className="text-gray-500">
                    {orderFilter === 'all' 
                      ? 'No orders have been placed yet' 
                      : `No ${orderFilter} orders found`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white/90 backdrop-blur-md border border-white/50 w-full max-w-4xl shadow-2xl rounded-3xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-white/30 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Order Details - #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Customer Info */}
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/40">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">👤</span>
                    </span>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <p className="text-sm text-blue-600 font-medium">Name</p>
                      <p className="font-semibold text-gray-800">{selectedOrder.customerName}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl">
                      <p className="text-sm text-green-600 font-medium">Email</p>
                      <p className="font-semibold text-gray-800">{selectedOrder.customerEmail}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <p className="text-sm text-purple-600 font-medium">Phone</p>
                      <p className="font-semibold text-gray-800">{selectedOrder.customerPhone}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-xl">
                      <p className="text-sm text-yellow-600 font-medium">Payment Status</p>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/40">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📦</span>
                    </span>
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div>
                          <p className="font-semibold text-gray-800">{item.productName}</p>
                          <p className="text-sm text-gray-600 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg inline-block mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                      <span className="font-bold text-lg text-emerald-700">Total Amount:</span>
                      <span className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        {formatCurrency(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Status and Actions */}
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/40">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📋</span>
                    </span>
                    Order Status
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-xl border ${getOrderStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                    {canAdvanceOrderStatus(selectedOrder.status) && (
                      <button
                        onClick={() => {
                          const nextStatus = getNextOrderStatus(selectedOrder.status)
                          if (nextStatus) {
                            handleOrderStatusUpdate(selectedOrder.id, nextStatus);
                            setSelectedOrder(null);
                          }
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Update to {getNextOrderStatus(selectedOrder.status)}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 bg-gray-100 p-3 rounded-lg">
                    Order Date: {formatOrderDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>
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
