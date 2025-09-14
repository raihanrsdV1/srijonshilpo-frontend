import { Link, Outlet, useLocation } from 'react-router-dom'

export default function AuthLayout() {
  const location = useLocation()
  const isLogin = location.pathname.includes('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-3000"></div>
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex items-center justify-center p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center max-w-lg">
            {/* Logo/Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-md border border-white/30">
              <span className="text-4xl text-white">🎨</span>
            </div>
            
            {/* Brand Text */}
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Srijon Shilpo
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
              Build stunning websites with our AI-powered visual builder. Transform your ideas into beautiful, professional websites without coding.
            </p>
            
            {/* Feature Points */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700 font-medium">Drag & Drop Visual Builder</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700 font-medium">AI-Powered Smart Objects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700 font-medium">One-Click Publishing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex items-center justify-center p-6 relative">
          <div className="w-full max-w-md">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-2xl text-white">🎨</span>
              </div>
              
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {isLogin ? 'Welcome Back!' : 'Join Srijon Shilpo'}
              </h2>
              <p className="text-gray-600 font-medium">
                {isLogin ? 'Sign in to continue your creative journey' : 'Start building amazing websites today'}
              </p>
            </div>

            {/* Auth Card */}
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Card Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-3xl"></div>
              
              {/* Form Content */}
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>

            {/* Switch Auth Mode */}
            <div className="text-center mt-6">
              <Link 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium transition-colors duration-300 group" 
                to={isLogin ? '/register' : '/login'}
              >
                <span>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <span className="text-purple-600 font-semibold group-hover:underline">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
