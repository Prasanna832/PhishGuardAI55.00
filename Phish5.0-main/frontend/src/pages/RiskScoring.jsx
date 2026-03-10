import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Shield, AlertTriangle, RefreshCw } from 'lucide-react'
import { usersAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

function RiskBadge({ level }) {
  const cls = {
    Low: 'risk-badge-low',
    Medium: 'risk-badge-medium',
    High: 'risk-badge-high',
  }
  return <span className={cls[level] || 'risk-badge-medium'}>{level}</span>
}

function RiskBar({ score }) {
  const color = score > 60 ? '#ef4444' : score > 30 ? '#f59e0b' : '#10b981'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-dark-700 rounded-full h-1.5 w-32">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8">{Math.round(score)}</span>
    </div>
  )
}

export default function RiskScoring() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(null)

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.list()
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const recalculate = async (userId) => {
    setRecalculating(userId)
    try {
      await usersAPI.getRisk(userId) // triggers recalc
      await fetchUsers()
    } finally {
      setRecalculating(null)
    }
  }

  const getRiskLevel = (score) => {
    if (score <= 30) return 'Low'
    if (score <= 60) return 'Medium'
    return 'High'
  }

  const deptRiskData = users.reduce((acc, user) => {
    const dept = user.department || 'Unknown'
    if (!acc[dept]) acc[dept] = { dept, total: 0, count: 0 }
    acc[dept].total += user.risk_score
    acc[dept].count++
    return acc
  }, {})

  const chartData = Object.values(deptRiskData).map(d => ({
    name: d.dept,
    avg_risk: Math.round(d.total / d.count),
  }))

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
  }

  const avgRisk = users.length ? (users.reduce((a, u) => a + u.risk_score, 0) / users.length) : 0
  const highRiskCount = users.filter(u => u.risk_score > 60).length
  const lowRiskCount = users.filter(u => u.risk_score <= 30).length

  return (
    <div>
      <h1 className="page-header">Risk Scoring Engine</h1>
      <p className="page-subtitle">Dynamic employee risk assessment based on behavioral analysis</p>

      {/* Formula Card */}
      <div className="glass-card p-5 mb-8 border border-cyan-500/20">
        <h3 className="text-sm text-cyan-400 font-medium uppercase tracking-wider mb-3">Risk Score Formula</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { factor: 'Click', impact: '+20', color: 'text-red-400' },
            { factor: 'Failed Sim', impact: '+15', color: 'text-orange-400' },
            { factor: 'Suspicious', impact: '+10', color: 'text-yellow-400' },
            { factor: 'Training', impact: '-10', color: 'text-emerald-400' },
          ].map(f => (
            <div key={f.factor} className="bg-white/5 rounded-lg p-3 text-center">
              <div className={`text-xl font-bold ${f.color}`}>{f.impact}</div>
              <div className="text-xs text-gray-400">{f.factor}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />0-30: Low Risk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />31-60: Medium Risk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />61-100: High Risk</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Total Employees', value: users.length, color: 'bg-cyan-500/20 text-cyan-400' },
          { icon: AlertTriangle, label: 'High Risk', value: highRiskCount, color: 'bg-red-500/20 text-red-400' },
          { icon: Shield, label: 'Low Risk', value: lowRiskCount, color: 'bg-emerald-500/20 text-emerald-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Department Chart */}
      {chartData.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">Risk by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="avg_risk" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.avg_risk > 60 ? '#ef4444' : entry.avg_risk > 30 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* User Table */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4">Employee Risk Scores</h3>
        {users.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            No employees yet. Register users to see risk scores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left pb-3 pr-4">Name</th>
                  <th className="text-left pb-3 pr-4">Department</th>
                  <th className="text-left pb-3 pr-4">Risk Score</th>
                  <th className="text-left pb-3 pr-4">Level</th>
                  <th className="text-left pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/3"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 text-xs font-bold">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{user.department}</td>
                    <td className="py-3 pr-4"><RiskBar score={user.risk_score} /></td>
                    <td className="py-3 pr-4"><RiskBadge level={getRiskLevel(user.risk_score)} /></td>
                    <td className="py-3">
                      <button
                        onClick={() => recalculate(user.id)}
                        disabled={recalculating === user.id}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <RefreshCw size={12} className={recalculating === user.id ? 'animate-spin' : ''} />
                        Recalc
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
