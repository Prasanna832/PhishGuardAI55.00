import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/AuthContext'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EmailAnalyzer from './pages/EmailAnalyzer'
import BulkAnalyzer from './pages/BulkAnalyzer'
import SimulationGenerator from './pages/SimulationGenerator'
import AICampaignGenerator from './pages/AICampaignGenerator'
import SimulationsMonitor from './pages/SimulationsMonitor'
import TrainingCenter from './pages/TrainingCenter'
import RiskScoring from './pages/RiskScoring'
import AIRiskPrediction from './pages/AIRiskPrediction'
import ThreatIntelligenceMap from './pages/ThreatIntelligenceMap'
import CommunityThreats from './pages/CommunityThreats'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-900">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-900">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analyzer" element={<ProtectedRoute><EmailAnalyzer /></ProtectedRoute>} />
          <Route path="/bulk-analyzer" element={<ProtectedRoute><BulkAnalyzer /></ProtectedRoute>} />
          <Route path="/simulations/generate" element={<ProtectedRoute><SimulationGenerator /></ProtectedRoute>} />
          <Route path="/ai-campaign-generator" element={<ProtectedRoute><AICampaignGenerator /></ProtectedRoute>} />
          <Route path="/simulations" element={<ProtectedRoute><SimulationsMonitor /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute><TrainingCenter /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><RiskScoring /></ProtectedRoute>} />
          <Route path="/ai-risk-prediction" element={<ProtectedRoute><AIRiskPrediction /></ProtectedRoute>} />
          <Route path="/threat-map" element={<ProtectedRoute><ThreatIntelligenceMap /></ProtectedRoute>} />
          <Route path="/threats" element={<ProtectedRoute><CommunityThreats /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
