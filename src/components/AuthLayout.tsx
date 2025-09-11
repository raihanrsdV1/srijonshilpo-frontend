import { Link, Outlet, useLocation } from 'react-router-dom'

export default function AuthLayout() {
  const location = useLocation()
  const isLogin = location.pathname.includes('login')

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-8">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">Srijon Shilpo</h1>
          <p className="opacity-90">
            Build AI-powered commerce experiences. Start with your account and explore the platform.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <Link className="text-primary hover:underline" to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'New here? Register' : 'Already have an account? Login'}
            </Link>
          </div>
          {/* glassy auth card */}
          <div className="glass-card rounded-xl p-6 shadow-xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
