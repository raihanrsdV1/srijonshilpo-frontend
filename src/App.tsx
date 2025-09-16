import { Route, Routes, Navigate } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import BuilderPage from './pages/BuilderPage'
import EcommercePage from './pages/EcommercePage'
import StoreManagementPage from './pages/StoreManagementPage'
import SimpleAIBuilder from './pages/SimpleAIBuilder'

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/builder" element={<BuilderPage />} />
      <Route path="/builder/:projectId" element={<BuilderPage />} />
      <Route path="/mock" element={<SimpleAIBuilder />} />
      <Route path="/store/:storeId" element={<StoreManagementPage />} />
      <Route path="/ecommerce" element={<EcommercePage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
