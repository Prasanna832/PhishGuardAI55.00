import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Mail, Target, BookOpen,
  TrendingUp, Map, AlertTriangle, Users, LogOut,
  Menu, X, ChevronRight, Bell, Settings, FileText, Zap, Brain, CreditCard
} from 'lucide-react'
import { useAuth } from '../services/AuthContext'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/analyzer', icon: Mail, label: 'Email Analyzer' },
  { path: '/bulk-analyzer', icon: FileText, label: 'Bulk Email Analyzer' },
  { path: '/simulations/generate', icon: Target, label: 'Simulation Generator' },
  { path: '/ai-campaign-generator', icon: Zap, label: 'AI Campaign Generator' },
  { path: '/simulations', icon: TrendingUp, label: 'Simulations Monitor' },
  { path: '/training', icon: BookOpen, label: 'Training Center' },
  { path: '/risk', icon: Users, label: 'Risk Scoring' },
  { path: '/ai-risk-prediction', icon: Brain, label: 'AI Risk Prediction' },
  { path: '/threat-map', icon: Map, label: 'Threat Intelligence' },
  { path: '/threats', icon: AlertTriangle, label: 'Community Reports' },
  { path: '/billing', icon: CreditCard, label: 'Billing & Plans' },
]

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-dark-900 cyber-grid overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col bg-dark-800/80 backdrop-blur-md border-r border-white/5 z-30 flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 glow-pulse">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-white font-bold text-sm leading-none">PhishGuard</div>
                <div className="text-cyan-400 text-xs">AI Defense Platform</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: sidebarOpen ? 4 : 0 }}
                  className={`flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`} size={18} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && sidebarOpen && (
                    <ChevronRight size={14} className="ml-auto text-cyan-400" />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/5">
          <AnimatePresence>
            {sidebarOpen && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 mb-3 px-2"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-sm font-bold flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-white/5 bg-dark-800/40 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
          <button className="relative text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-xs text-black font-bold flex items-center justify-center">3</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
