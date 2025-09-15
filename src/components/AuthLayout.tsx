import { Link, Outlet, useLocation } from 'react-router-dom'

export default function AuthLayout() {
  const location = useLocation()
  const isLogin = location.pathname.includes('login')

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      backgroundSize: '300% 300%',
      animation: 'gradientShift 8s ease infinite'
    }}>
      {/* Inject animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
      `}</style>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-10" style={{
          background: 'rgba(59, 130, 246, 0.3)',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full opacity-10" style={{
          background: 'rgba(168, 85, 247, 0.3)',
          filter: 'blur(30px)',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 rounded-full opacity-10" style={{
          background: 'rgba(34, 197, 94, 0.3)',
          filter: 'blur(50px)',
          animation: 'float 7s ease-in-out infinite'
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex items-center justify-center p-12 relative">
          <div className="relative z-10 text-center max-w-lg">
            {/* Logo/Icon */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              backdropFilter: 'blur(20px)'
            }} className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-4xl text-blue-400 font-bold">S</span>
            </div>
            
            {/* Brand Text */}
            <h1 className="text-5xl font-bold text-white mb-6">
              Srijon Shilpo
            </h1>
            <p className="text-xl leading-relaxed mb-8 font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Build stunning e-commerce websites with our AI-powered visual builder. Transform your ideas into beautiful, professional online stores.
            </p>
            
            {/* Feature Points */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.4)'
                }} className="w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">✓</span>
                </div>
                <span className="text-white font-medium">Drag & Drop Visual Builder</span>
              </div>
              <div className="flex items-center gap-3">
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)'
                }} className="w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-bold">✓</span>
                </div>
                <span className="text-white font-medium">E-commerce Ready Components</span>
              </div>
              <div className="flex items-center gap-3">
                <div style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid rgba(168, 85, 247, 0.4)'
                }} className="w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-purple-400 text-sm font-bold">✓</span>
                </div>
                <span className="text-white font-medium">One-Click Publishing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex items-center justify-center p-6 relative">
          <div className="w-full max-w-md">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="lg:hidden w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl" style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                backdropFilter: 'blur(20px)'
              }}>
                <span className="text-2xl text-blue-400 font-bold">S</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back!' : 'Join Srijon Shilpo'}
              </h2>
              <p className="font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {isLogin ? 'Sign in to continue your creative journey' : 'Start building amazing websites today'}
              </p>
            </div>

            {/* Auth Card */}
            <div style={{
              background: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }} className="rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              
              {/* Form Content */}
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>

            {/* Switch Auth Mode */}
            <div className="text-center mt-6">
              <Link 
                className="inline-flex items-center gap-2 font-medium transition-colors duration-300 group" 
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                to={isLogin ? '/register' : '/login'}
              >
                <span>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <span className="text-blue-400 font-semibold group-hover:underline">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300 text-blue-400">
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
