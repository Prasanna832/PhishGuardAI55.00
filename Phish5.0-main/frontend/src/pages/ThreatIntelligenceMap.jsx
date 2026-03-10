import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Map, Globe, TrendingUp, AlertTriangle, Activity, BarChart3 } from 'lucide-react'
import { threatsAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'

const THEME_COLORS = ['#00d4ff', '#9b59b6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899']

const WORLD_REGIONS = [
  { name: 'North America', x: 20, y: 30, intensity: 85, threats: ['CEO Fraud', 'Payroll Scams'] },
  { name: 'Europe', x: 48, y: 25, intensity: 72, threats: ['Bank Verification', 'Tech Support'] },
  { name: 'Asia Pacific', x: 72, y: 35, intensity: 90, threats: ['Job Offer Scams', 'Delivery Fraud'] },
  { name: 'South America', x: 28, y: 58, intensity: 55, threats: ['Prize Scams', 'Account Verification'] },
  { name: 'Africa', x: 52, y: 55, intensity: 60, threats: ['Advance Fee', 'Bank Scams'] },
  { name: 'Middle East', x: 60, y: 38, intensity: 68, threats: ['Investment Scams', 'CEO Fraud'] },
]

function ThreatHeatmap() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Globe size={18} className="text-cyan-400" />
        Global Phishing Threat Heatmap
      </h3>
      <div className="relative bg-dark-700/50 rounded-xl overflow-hidden border border-white/5" style={{ paddingTop: '50%' }}>
        {/* Simplified world map using SVG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 55" className="w-full h-full opacity-20">
            {/* Simplified continent shapes */}
            <path d="M15 15 L35 12 L40 20 L38 30 L30 35 L20 32 L12 25 Z" fill="#334155" />
            <path d="M42 12 L58 10 L65 18 L62 28 L55 30 L45 25 L40 18 Z" fill="#334155" />
            <path d="M65 18 L80 15 L88 22 L85 35 L78 38 L68 30 L62 22 Z" fill="#334155" />
            <path d="M18 38 L30 35 L35 45 L28 50 L18 47 Z" fill="#334155" />
            <path d="M45 35 L58 33 L60 42 L52 46 L45 42 Z" fill="#334155" />
          </svg>
          {/* Threat hotspot dots */}
          {WORLD_REGIONS.map((region, i) => (
            <motion.div
              key={region.name}
              className="absolute"
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="relative group cursor-pointer">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.3 }}
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: `rgba(${region.intensity > 70 ? '239,68,68' : region.intensity > 55 ? '245,158,11' : '16,185,129'}, 0.6)`,
                    boxShadow: `0 0 ${region.intensity / 5}px rgba(${region.intensity > 70 ? '239,68,68' : '245,158,11'}, 0.8)`,
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-dark-700 border border-white/10 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
                    <div className="text-white font-medium">{region.name}</div>
                    <div className="text-red-400">Threat Level: {region.intensity}%</div>
                    <div className="text-gray-400 mt-1">{region.threats.join(', ')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />High (70%+)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Medium (55-70%)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Lower Risk</span>
      </div>
    </div>
  )
}

export default function ThreatIntelligenceMap() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    threatsAPI.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const globalThemes = [
    { theme: 'Bank Verification Scams', count: 2847, trend: '+12%', region: 'Global', color: '#00d4ff' },
    { theme: 'Payroll Update Scams', count: 1923, trend: '+8%', region: 'North America', color: '#9b59b6' },
    { theme: 'Delivery Fraud', count: 3102, trend: '+24%', region: 'Europe/Asia', color: '#f59e0b' },
    { theme: 'Job Offer Scams', count: 1456, trend: '+15%', region: 'Asia Pacific', color: '#10b981' },
    { theme: 'CEO Fraud / BEC', count: 892, trend: '+5%', region: 'Global', color: '#ef4444' },
    { theme: 'Tech Support Scams', count: 2103, trend: '+19%', region: 'North America', color: '#3b82f6' },
  ]

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
  }

  const pieData = globalThemes.map(t => ({ name: t.theme.split(' ')[0], value: t.count }))

  return (
    <div>
      <h1 className="page-header">Global Phishing Intelligence Map</h1>
      <p className="page-subtitle">Real-time phishing pattern analysis and global threat landscape</p>

      {/* Heatmap */}
      <div className="mb-8">
        <ThreatHeatmap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Themes Chart */}
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-400" />
            Top Phishing Themes (Global)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={globalThemes.map(t => ({ name: t.theme.split(' ')[0], count: t.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {globalThemes.map((entry, index) => (
                  <Cell key={index} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-cyan-400" />
            Threat Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} />
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Cards */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-400" />
          Active Global Phishing Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalThemes.map((theme, i) => (
            <motion.div
              key={theme.theme}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: theme.color }} />
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{theme.trend}</span>
              </div>
              <div className="text-white font-medium text-sm mb-1">{theme.theme}</div>
              <div className="text-2xl font-bold" style={{ color: theme.color }}>
                {theme.count.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">reported incidents</div>
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Globe size={10} />
                {theme.region}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
