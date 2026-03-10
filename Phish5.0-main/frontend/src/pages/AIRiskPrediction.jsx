import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Users, AlertTriangle, Shield, BookOpen, TrendingUp,
  ChevronDown, Search, Loader
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import CountUp from 'react-countup'
import { riskPredictionAPI, usersAPI } from '../services/api'

function RiskGauge({ probability }) {
  const angle = (probability / 100) * 180 - 90
  const color = probability >= 75 ? '#ef4444' : probability >= 50 ? '#f59e0b' : probability >= 25 ? '#3b82f6' : '#10b981'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(probability / 100) * 251.2} 251.2`}
            opacity="0.9"
          />
          <line
            x1="100" y1="100"
            x2={100 + 70 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={100 + 70 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={color} />
          <text x="15" y="96" fill="#6b7280" fontSize="10">0%</text>
          <text x="160" y="96" fill="#6b7280" fontSize="10">100%</text>
        </svg>
      </div>
      <div className="text-3xl font-bold mt-1" style={{ color }}>
        <CountUp end={probability} duration={1.5} />%
      </div>
      <div className="text-xs text-gray-400 mt-0.5">Risk Probability</div>
    </div>
  )
}

export default function AIRiskPrediction() {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await usersAPI.list()
      setUsers(res.data)
    } catch {
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handlePredict = async () => {
    if (!selectedUserId) return
    setLoading(true)
    setError('')
    setPrediction(null)
    try {
      const res = await riskPredictionAPI.predict({ user_id: parseInt(selectedUserId) })
      setPrediction(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Risk prediction failed.')
    } finally {
      setLoading(false)
    }
  }

  const selectedUser = users.find((u) => u.id === parseInt(selectedUserId))

  const riskBarData = prediction ? [
    { name: 'Click Count', value: prediction.click_count, color: '#ef4444' },
    { name: 'Sim Failures', value: prediction.simulation_failures, color: '#f59e0b' },
    { name: 'Training %', value: prediction.training_completion, color: '#10b981' },
    { name: 'Risk Score', value: prediction.current_risk_score, color: '#3b82f6' },
    { name: 'Predicted %', value: prediction.risk_probability, color: '#8b5cf6' },
  ] : []

  return (
    <div>
      <h1 className="page-header">AI Behavioral Risk Prediction</h1>
      <p className="page-subtitle">Predict which employees are most likely to fall for phishing attacks using AI behavioral analysis</p>

      {/* Employee Selector */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-4">
          <Brain size={16} />
          Employee Risk Analysis
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
              <Users size={12} /> Select Employee
            </label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2.5 text-left text-sm focus:outline-none focus:border-cyan-500/50 flex items-center justify-between"
            >
              <span className={selectedUser ? 'text-white' : 'text-gray-600'}>
                {selectedUser ? `${selectedUser.name} — ${selectedUser.department}` : 'Choose an employee...'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-20 w-full mt-1 bg-dark-800 border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                >
                  {loadingUsers ? (
                    <div className="p-3 text-center text-gray-500 text-sm">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">No users found</div>
                  ) : (
                    users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setSelectedUserId(String(u.id)); setDropdownOpen(false) }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-white">{u.name}</span>
                          <span className="text-gray-500 ml-2">({u.department})</span>
                        </div>
                        <span className="text-xs text-gray-500">Risk: {u.risk_score?.toFixed(0) ?? '—'}</span>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            onClick={handlePredict}
            disabled={loading || !selectedUserId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
            Predict Risk
          </motion.button>
        </div>
        {error && (
          <div className="mt-3 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 flex items-center justify-center">
              <Brain className="text-cyan-400" size={32} />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <div className="text-cyan-400 font-semibold">AI Analyzing Behavior</div>
            <div className="text-gray-500 text-sm mt-1">Predicting phishing vulnerability...</div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {prediction && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Employee Info */}
              <div className="glass-card p-5 border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold">
                    {prediction.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{prediction.user_name}</div>
                    <div className="text-gray-400 text-xs">{prediction.department}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-dark-700/50 rounded-lg p-2.5 text-center">
                    <div className="text-xs text-gray-500">Current Risk</div>
                    <div className="text-white font-bold text-lg">
                      <CountUp end={prediction.current_risk_score} duration={1} decimals={0} />
                    </div>
                  </div>
                  <div className="bg-dark-700/50 rounded-lg p-2.5 text-center">
                    <div className="text-xs text-gray-500">Risk Level</div>
                    <div className={`font-bold text-lg ${
                      prediction.risk_level === 'Critical' ? 'text-red-400' :
                      prediction.risk_level === 'High' ? 'text-orange-400' :
                      prediction.risk_level === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {prediction.risk_level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Probability Gauge */}
              <div className="glass-card p-5 flex items-center justify-center border border-purple-500/20">
                <RiskGauge probability={prediction.risk_probability} />
              </div>

              {/* Stats */}
              <div className="glass-card p-5 space-y-3 border border-blue-500/20">
                <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-400" />
                  Behavioral Metrics
                </div>
                {[
                  { label: 'Phishing Clicks', value: prediction.click_count, color: 'text-red-400' },
                  { label: 'Simulation Failures', value: prediction.simulation_failures, color: 'text-orange-400' },
                  { label: 'Training Completion', value: `${prediction.training_completion}%`, color: 'text-emerald-400' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                    <span className="text-gray-400 text-sm">{m.label}</span>
                    <span className={`font-bold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-400" />
                Risk Factor Analysis
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskBarData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {riskBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explanation */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-400" />
                Behavioral Explanation
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed bg-orange-500/5 p-4 rounded-lg border border-orange-500/10">
                {prediction.behavioral_explanation}
              </p>
            </div>

            {/* Recommendations */}
            {prediction.recommended_training?.length > 0 && (
              <div className="glass-card p-5">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="text-emerald-400" />
                  Recommended Training
                </h4>
                <div className="space-y-2">
                  {prediction.recommended_training.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg"
                    >
                      <Shield size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!prediction && !loading && (
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3 min-h-48">
          <Brain size={40} className="text-gray-600" />
          <p className="text-gray-500">Select an employee above to generate an AI behavioral risk prediction</p>
        </div>
      )}
    </div>
  )
}
