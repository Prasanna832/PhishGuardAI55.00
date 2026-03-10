import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import CountUp from 'react-countup'
import { Users, Target, TrendingUp, AlertTriangle, Shield, ChevronRight, RefreshCw } from 'lucide-react'
import { dashboardAPI } from '../services/api'

const COLORS = ['#10b981', '#f59e0b', '#ef4444']

function StatCard({ icon: Icon, label, value, unit, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <TrendingUp size={14} className="text-emerald-400" />
      </div>
      <div className="text-2xl font-bold text-white">
        <CountUp end={value} duration={2} decimals={unit === '%' ? 1 : 0} />
        {unit && <span className="text-lg text-gray-400">{unit}</span>}
      </div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </motion.div>
  )
}

function RiskBadge({ level }) {
  const cls = {
    Low: 'risk-badge-low',
    Medium: 'risk-badge-medium',
    High: 'risk-badge-high',
  }
  return <span className={cls[level] || 'risk-badge-medium'}>{level}</span>
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [distribution, setDistribution] = useState([])
  const [highRisk, setHighRisk] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const [statsRes, trendRes, distRes, riskRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRiskTrend(),
        dashboardAPI.getRiskDistribution(),
        dashboardAPI.getHighRiskEmployees(),
      ])
      setStats(statsRes.data)
      setTrend(trendRes.data)
      setDistribution(distRes.data)
      setHighRisk(riskRes.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { icon: Users, label: 'Total Employees', value: stats?.total_employees || 0, color: 'bg-cyan-500/20 text-cyan-400', delay: 0 },
    { icon: Target, label: 'Active Simulations', value: stats?.active_simulations || 0, color: 'bg-purple-500/20 text-purple-400', delay: 0.1 },
    { icon: AlertTriangle, label: 'Company Risk Index', value: stats?.company_risk_index || 0, unit: '%', color: 'bg-orange-500/20 text-orange-400', delay: 0.2 },
    { icon: Shield, label: 'Phishing Click Rate', value: stats?.phishing_click_rate || 0, unit: '%', color: 'bg-red-500/20 text-red-400', delay: 0.3 },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">Cyber Intelligence Dashboard</h1>
          <p className="page-subtitle">Real-time organizational security posture</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-white font-semibold mb-4">7-Day Risk Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="risk_score" stroke="#00d4ff" strokeWidth={2} fill="url(#riskGradient)" name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-white font-semibold mb-4">Risk Distribution</h3>
          {distribution.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* High Risk Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">High Risk Employees</h3>
          <span className="text-xs text-gray-500">{highRisk.length} employees</span>
        </div>

        {highRisk.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p>No employee data yet. Add users and run simulations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left pb-3 pr-4">Employee</th>
                  <th className="text-left pb-3 pr-4">Department</th>
                  <th className="text-left pb-3 pr-4">Risk Score</th>
                  <th className="text-left pb-3">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {highRisk.map((emp, i) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="py-3 pr-4 text-white font-medium">{emp.name}</td>
                    <td className="py-3 pr-4 text-gray-400">{emp.department}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-dark-700 rounded-full h-1.5 w-24">
                          <div
                            className={`h-1.5 rounded-full ${emp.risk_score > 60 ? 'bg-red-500' : emp.risk_score > 30 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${emp.risk_score}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-xs">{Math.round(emp.risk_score)}</span>
                      </div>
                    </td>
                    <td className="py-3"><RiskBadge level={emp.risk_level} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
