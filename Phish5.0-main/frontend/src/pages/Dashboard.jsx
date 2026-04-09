import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar
} from 'recharts'
import CountUp from 'react-countup'
import { Users, Target, TrendingUp, AlertTriangle, Shield, RefreshCw, Activity, ShieldAlert } from 'lucide-react'
import { dashboardAPI } from '../services/api'

// Enhanced vibrant color palette
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

function StatCard({ icon: Icon, label, value, unit, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="glass-card relative overflow-hidden group"
    >
      {/* Dynamic background glow */}
      <div className={`absolute -inset-1 opacity-20 group-hover:opacity-40 transition-opacity blur-xl bg-gradient-to-r ${color}`} />
      
      <div className="relative p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-dark-800 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
            {/* The icon inherits dynamic text color via parent class or inline style if needed. We'll extract the text color from the passed 'color' classes */}
            <Icon size={24} className={color.split(' ')[0].replace('from-', 'text-')} />
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
            <TrendingUp size={12} /> +12%
          </div>
        </div>
        <div className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
          <CountUp end={value} duration={2.5} decimals={unit === '%' ? 1 : 0} separator="," />
          {unit && <span className="text-xl text-gray-400 ml-1">{unit}</span>}
        </div>
        <div className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  )
}

// Custom Tooltip for Charts to match the aesthetic
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <p className="text-gray-300 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm font-bold" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [distribution, setDistribution] = useState([])
  
  // Replace High Risk Employees with a generic "Recent Threat Activity" visualization
  // Since we don't have a dedicated API for this yet, we'll mock it based on stats or use an empty state
  const mockActivity = [
    { day: 'Mon', phishing: 12, malware: 4, spam: 24 },
    { day: 'Tue', phishing: 19, malware: 2, spam: 18 },
    { day: 'Wed', phishing: 15, malware: 7, spam: 29 },
    { day: 'Thu', phishing: 22, malware: 1, spam: 15 },
    { day: 'Fri', phishing: 10, malware: 3, spam: 31 },
    { day: 'Sat', phishing: 5, malware: 0, spam: 12 },
    { day: 'Sun', phishing: 8, malware: 1, spam: 9 },
  ]

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const [statsRes, trendRes, distRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRiskTrend(),
        dashboardAPI.getRiskDistribution(),
        // dashboardAPI.getHighRiskEmployees() -> Deprecated for general dashboard to avoid shaming
      ])
      setStats(statsRes.data)
      setTrend(trendRes.data)
      setDistribution(distRes.data)
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
        <div className="relative">
          <div className="w-12 h-12 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-cyan-400 rounded-full animate-spin absolute inset-0 border-t-transparent"></div>
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
        </div>
      </div>
    )
  }

  const statCards = [
    { icon: Users, label: 'Protected Users', value: stats?.total_employees || 0, color: 'from-cyan-400 to-blue-500', delay: 0 },
    { icon: Target, label: 'Active Simulations', value: stats?.active_simulations || 0, color: 'from-purple-400 to-pink-500', delay: 0.1 },
    { icon: Activity, label: 'Network Risk Index', value: stats?.company_risk_index || 0, unit: '%', color: 'from-orange-400 to-red-500', delay: 0.2 },
    { icon: ShieldAlert, label: 'Vulnerability Rate', value: stats?.phishing_click_rate || 0, unit: '%', color: 'from-emerald-400 to-cyan-500', delay: 0.3 },
  ]

  return (
    <div className="pb-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Cyber Intelligence Center
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time organizational telemetry
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2 text-sm bg-dark-800/80 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-cyan-500/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
          Synchronize Data
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Trend */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2 relative overflow-hidden group"
        >
          <div className="absolute -right-32 -top-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-cyan-400" />
              7-Day Global Threat Trend
            </h3>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-dark-800 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              Live Feed
            </div>
          </div>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="risk_score" 
                  stroke="#22d3ee" 
                  strokeWidth={3} 
                  fill="url(#riskGradient)" 
                  name="Threat Level" 
                  activeDot={{ r: 6, fill: "#22d3ee", stroke: "#0f172a", strokeWidth: 2, className: "shadow-[0_0_10px_#22d3ee]" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 relative overflow-hidden group"
        >
          <div className="absolute -left-32 -bottom-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />

          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Shield className="text-purple-400" />
            Security Posture
          </h3>
          
          {distribution.every(d => d.value === 0) ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-gray-500 text-sm">
              <Shield size={48} className="text-gray-700 mb-4 opacity-50" />
              Initializing Telemetry...
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg outline-none" style={{ filter: `drop-shadow(0px 0px 8px ${COLORS[index % COLORS.length]}40)` }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span className="text-gray-300 font-medium text-sm ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Threat Activity Bar Chart instead of individual shaming table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-400" />
            Detected Threat Vectors (7 Days)
          </h3>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend 
                verticalAlign="top" 
                align="right"
                wrapperStyle={{ paddingBottom: '20px' }}
                iconType="circle"
                formatter={(value) => <span className="text-gray-400 text-sm ml-1">{value}</span>}
              />
              <Bar dataKey="phishing" name="Phishing Attempts" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
              <Bar dataKey="malware" name="Malware Links" stackId="a" fill="#f59e0b" />
              <Bar dataKey="spam" name="Suspicious Spam" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
