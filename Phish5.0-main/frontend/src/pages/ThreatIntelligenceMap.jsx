import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, AlertTriangle, Activity, BarChart3, Crosshair, ShieldAlert, Zap, Radio, Target, Clock } from 'lucide-react'
import { threatsAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'

const THEME_COLORS = ['#00d4ff', '#9b59b6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

const WORLD_REGIONS = [
  { name: 'North America', x: 22, y: 32, intensity: 85, threats: ['CEO Fraud', 'Payroll Scams'], color: '#ef4444' },
  { name: 'Europe', x: 48, y: 28, intensity: 72, threats: ['Bank Verification', 'Tech Support'], color: '#f59e0b' },
  { name: 'Asia Pacific', x: 74, y: 38, intensity: 90, threats: ['Job Offer Scams', 'Delivery Fraud'], color: '#ef4444' },
  { name: 'South America', x: 30, y: 65, intensity: 55, threats: ['Prize Scams', 'Account Verification'], color: '#10b981' },
  { name: 'Africa', x: 52, y: 58, intensity: 60, threats: ['Advance Fee', 'Bank Scams'], color: '#f59e0b' },
  { name: 'Middle East', x: 62, y: 42, intensity: 68, threats: ['Investment Scams', 'CEO Fraud'], color: '#f59e0b' },
]

const LIVE_FEEDS = [
  { id: 1, time: 'Just now', event: 'Suspicious Login Attempt', location: 'Frankfurt, DE', risk: 'High' },
  { id: 2, time: '2m ago', event: 'Mass Emotet Campaign', location: 'Tokyo, JP', risk: 'Critical' },
  { id: 3, time: '5m ago', event: 'BEC Fraud Blocked', location: 'New York, US', risk: 'High' },
  { id: 4, time: '12m ago', event: 'Credential Harvesting', location: 'London, UK', risk: 'Medium' },
  { id: 5, time: '18m ago', event: 'Phishing Sandbox Evasion', location: 'Sydney, AU', risk: 'Critical' },
  { id: 6, time: '21m ago', event: 'Malicious Office Macro', location: 'São Paulo, BR', risk: 'Medium' },
]

function ThreatHeatmap() {
  return (
    <div className="glass-card p-0 overflow-hidden relative h-full min-h-[400px] border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.05)] rounded-2xl">
      
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-5 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <h3 className="text-white font-bold flex items-center gap-2 text-lg drop-shadow-md">
          <Globe className="text-cyan-400" />
          Global Intelligence Radar
        </h3>
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 bg-cyan-950/50 px-3 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          LAT: SENSOR.ACTIVE
        </div>
      </div>

      {/* Map Background container */}
      <div className="absolute inset-0 bg-[#050b14]">
        {/* Abstract Cyber Grid */}
        <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 80%), linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 20px 20px, 20px 20px',
            backgroundPosition: '0 0, center center, center center'
        }} />

        {/* Simplified Continents using Polygons */}
        <svg viewBox="0 0 100 65" className="w-full h-full opacity-40 absolute inset-0 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          {/* North America */}
          <polygon points="10,15 25,12 35,18 40,30 30,35 15,30 5,20" fill="transparent" stroke="#0ea5e9" strokeWidth="0.2" className="animate-pulse" />
          {/* South America */}
          <polygon points="25,40 35,38 40,48 35,60 25,62 18,50" fill="transparent" stroke="#0ea5e9" strokeWidth="0.2" />
          {/* Europe */}
          <polygon points="45,15 55,10 65,18 62,30 52,32 42,25" fill="transparent" stroke="#0ea5e9" strokeWidth="0.2" />
          {/* Asia */}
          <polygon points="65,18 80,12 95,20 90,35 80,40 68,30" fill="transparent" stroke="#0ea5e9" strokeWidth="0.2" />
          {/* Africa */}
          <polygon points="48,35 60,32 68,40 60,55 50,52" fill="transparent" stroke="#0ea5e9" strokeWidth="0.2" />
          {/* Australia */}
          <polygon points="75,45 85,42 90,48 85,55 75,52" fill="transparent" stroke="#0ea5e9" strokeWidth="0.2" />
        </svg>

        {/* Radar Sweep Animation */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -mt-[400px] -ml-[400px] pointer-events-none">
          <motion.div 
            className="w-full h-full rounded-full opacity-40 mix-blend-screen"
            style={{ background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(6, 182, 212, 0.4) 360deg)' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          />
          {/* Concentric circles */}
          <div className="absolute top-1/2 left-1/2 w-full h-full -mt-[50%] -ml-[50%] rounded-full border border-cyan-500/10 scale-25" />
          <div className="absolute top-1/2 left-1/2 w-full h-full -mt-[50%] -ml-[50%] rounded-full border border-cyan-500/10 scale-50" />
          <div className="absolute top-1/2 left-1/2 w-full h-full -mt-[50%] -ml-[50%] rounded-full border border-cyan-500/10 scale-75" />
          <div className="absolute top-1/2 left-1/2 w-full h-full -mt-[50%] -ml-[50%] rounded-full border border-cyan-500/10 scale-100" />
        </div>

        {/* Threat hotspots */}
        {WORLD_REGIONS.map((region, i) => (
          <motion.div
            key={region.name}
            className="absolute z-10"
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.2 }}
          >
            <div className="relative group cursor-pointer -ml-2 -mt-2">
              <motion.div
                animate={{ scale: [1, 3, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 + i * 0.5 }}
                className="absolute inset-0 w-4 h-4 rounded-full"
                style={{ background: region.color }}
              />
              <div 
                className="relative w-4 h-4 rounded-full border-2 border-[#050b14]"
                style={{ backgroundColor: region.color, boxShadow: `0 0 15px ${region.color}` }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-30 pointer-events-none w-56">
                <div className="bg-dark-900/95 backdrop-blur-md border border-white/10 rounded-lg p-3 text-xs shadow-2xl">
                  <div className="flex items-center gap-2 text-white font-bold mb-1 border-b border-white/10 pb-1">
                     <Target size={12} style={{ color: region.color }} /> {region.name}
                  </div>
                  <div className="flex justify-between py-1">
                     <span className="text-gray-400">Threat Level:</span>
                     <span style={{ color: region.color }} className="font-mono font-bold">{region.intensity}%</span>
                  </div>
                  <div className="text-gray-400 mt-1 leading-relaxed">Top Vectors: <span className="text-gray-200">{region.threats.join(', ')}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  )
}

function LiveFeed() {
  const [feeds, setFeeds] = useState(LIVE_FEEDS)

  useEffect(() => {
    // Simulate rotating feeds taking the last and putting it at the front to simulate scrolling
    const interval = setInterval(() => {
      setFeeds(prev => {
        const newFeed = [...prev];
        const last = newFeed.pop();
        // Give it a new ID so AnimatePresence sees it as new
        newFeed.unshift({...last, id: Date.now()});
        return newFeed;
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden border-t-2 border-t-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.05)] rounded-2xl">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-dark-800/80">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Radio className="text-red-400 animate-pulse" size={18} />
          Live Threat Feed
        </h3>
      </div>
      <div className="flex-1 p-3 relative overflow-hidden bg-dark-900/50">
        {/* Gradient fade out at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark-800 to-transparent z-10 pointer-events-none" />
        
        <div className="space-y-2 relative h-[360px]">
          <AnimatePresence initial={false}>
            {feeds.map((feed, i) => (
              <motion.div
                key={feed.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1 - (i * 0.15), x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="bg-dark-800/80 border border-white/5 p-3 rounded-lg flex items-center justify-between hover:border-white/20 transition-colors"
                style={{ zIndex: feeds.length - i }}
              >
                <div>
                  <div className="text-sm font-bold text-gray-200">{feed.event}</div>
                  <div className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                    <Globe size={10} /> {feed.location}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-1 ${
                    feed.risk === 'Critical' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 
                    feed.risk === 'High' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' : 
                    'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                  }`}>
                    {feed.risk}
                  </span>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                     <Clock size={10} /> {feed.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-10"
    >
      <div className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Crosshair className="text-cyan-400" size={32} />
          Threat Intelligence Core
        </h1>
        <p className="text-gray-400">
          Real-time global phishing pattern analysis, network radar, and vector trends.
        </p>
      </div>

      {/* Top Map & Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[450px]">
        <div className="lg:col-span-2 h-full">
          <ThreatHeatmap />
        </div>
        <div className="h-full">
          <LiveFeed />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Themes Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border border-white/5 hover:border-cyan-500/20 transition-colors rounded-2xl"
        >
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-400" />
            Top Phishing Themes (Global)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={globalThemes.map(t => ({ name: t.theme.split(' ')[0], count: t.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', color: '#e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {globalThemes.map((entry, index) => (
                  <Cell key={index} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribution Pie */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border border-white/5 hover:border-cyan-500/20 transition-colors rounded-2xl"
        >
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Activity size={18} className="text-cyan-400" />
            Threat Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={THEME_COLORS[index % THEME_COLORS.length]} style={{ outline: 'none' }} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', color: '#e2e8f0' }} />
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px', paddingLeft: '4px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Threat Cards */}
      <div className="glass-card p-6 border border-white/5 rounded-2xl">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-400" />
          Active Global Phishing Themes Vectors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {globalThemes.map((theme, i) => (
            <motion.div
              key={theme.theme}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.4 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-dark-800/40 rounded-xl p-5 border border-white/5 transition-all overflow-hidden relative group cursor-default"
            >
               {/* Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${theme.color}, transparent 70%)` }}
              />
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="w-3 h-3 rounded-full mt-1.5 shadow-lg" style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }} />
                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">
                  {theme.trend}
                </span>
              </div>
              
              <div className="text-gray-300 font-medium text-sm mb-1 relative z-10">{theme.theme}</div>
              <div className="text-3xl font-black tracking-tight relative z-10" style={{ color: theme.color }}>
                {theme.count.toLocaleString()}
              </div>
              
              <div className="flex items-center justify-between mt-4 relative z-10">
                <div className="text-xs text-gray-500 font-medium">REPORTED INCIDENTS</div>
                <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5 bg-dark-900/50 px-2 py-1 rounded">
                  <Globe size={11} className="text-cyan-500" />
                  {theme.region}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
    </motion.div>
  )
}
