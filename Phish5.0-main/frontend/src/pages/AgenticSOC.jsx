import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Shield, Radar, Play, Cpu, Activity, AlertTriangle, Bot, RefreshCw } from 'lucide-react'
import { socAPI } from '../services/api'

const STATUS_COLORS = {
  Safe: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  Suspicious: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  Attack: 'text-red-400 border-red-500/40 bg-red-500/10',
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444']
const FEED_UPDATE_INTERVAL_MS = 450
const MAX_FEED_ITEMS = 30

function formatLog(log) {
  const ts = new Date(log.timestamp)
  return `${ts.toLocaleTimeString()} | ${log.username} | ${log.action} | ${log.country} | ${log.ip_address}`
}

export default function AgenticSOC() {
  const [logs, setLogs] = useState([])
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [feed, setFeed] = useState([])
  const [feedIndex, setFeedIndex] = useState(0)
  const [autoDetect, setAutoDetect] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [count, setCount] = useState(25)
  const feedRef = useRef(null)

  const stats = useMemo(() => {
    const total = results.length
    const threats = results.filter((item) => item.analysis.status !== 'Safe').length
    const highRiskUsers = new Set(results.filter((item) => item.analysis.risk_score >= 71).map((item) => item.log.username)).size
    return { total, threats, highRiskUsers }
  }, [results])

  const distribution = useMemo(() => {
    const safe = results.filter((item) => item.analysis.status === 'Safe').length
    const suspicious = results.filter((item) => item.analysis.status === 'Suspicious').length
    const attack = results.filter((item) => item.analysis.status === 'Attack').length
    return [
      { name: 'Safe', value: safe },
      { name: 'Suspicious', value: suspicious },
      { name: 'Attack', value: attack },
    ]
  }, [results])

  const userRanking = useMemo(() => {
    const scoreMap = new Map()
    for (const row of results) {
      const entry = scoreMap.get(row.log.username) || { sum: 0, count: 0 }
      entry.sum += row.analysis.risk_score
      entry.count += 1
      scoreMap.set(row.log.username, entry)
    }
    return [...scoreMap.entries()]
      .map(([user, value]) => ({ user, risk: Math.round(value.sum / value.count) }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 8)
  }, [results])

  const runBatchAnalysis = async (batchLogs) => {
    if (!batchLogs.length) return
    setAnalyzing(true)
    try {
      const response = await socAPI.analyzeBatch(batchLogs.map((log) => ({
        username: log.username,
        action: log.action,
        ip_address: log.ip_address,
        country: log.country,
        resource: log.resource,
        success: log.success,
        timestamp: log.timestamp,
      })))
      setResults(response.data.results)
      setSelected(response.data.results[0] || null)
      setFeed([])
      setFeedIndex(0)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await socAPI.generateLogs({ count })
      const generated = response.data
      setLogs(generated)
      setResults([])
      setSelected(null)
      setFeed([])
      setFeedIndex(0)
      if (autoDetect) {
        await runBatchAnalysis(generated)
      }
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (!results.length) return
    const interval = setInterval(() => {
      setFeed((current) => {
        if (feedIndex >= results.length) return current
        const next = [...current, results[feedIndex]].slice(-MAX_FEED_ITEMS)
        return next
      })
      setFeedIndex((index) => (index < results.length ? index + 1 : index))
    }, FEED_UPDATE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [results, feedIndex])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [feed])

  const tableRows = analyzing ? Array.from({ length: 6 }, (_, index) => ({ key: `skeleton-${index}` })) : results

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-6 backdrop-blur-xl">
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Agentic SOC Prototype</h1>
            <p className="mt-2 text-sm text-cyan-100/80">Synthetic telemetry, autonomous detection, explainable risk scoring</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            AI Agent Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">Total Logs</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">Threats Detected</p>
          <p className="mt-2 text-3xl font-bold text-red-400">{stats.threats}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">High Risk Users</p>
          <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.highRiskUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass-card xl:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Control Panel</h2>
            <div className="flex items-center gap-2 text-xs text-cyan-300"><Cpu size={14} /> Detection Core Online</div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(event) => setCount(Number(event.target.value || 1))}
              className="input-field"
            />
            <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
              {generating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
              Generate Logs
            </button>
            <button onClick={() => runBatchAnalysis(logs)} disabled={analyzing || !logs.length} className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-60">
              {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <Radar size={16} />}
              Run Analysis
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setAutoDetect((value) => !value)}
              className={`rounded-full border px-3 py-1 text-sm ${autoDetect ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-gray-600 bg-dark-900 text-gray-300'}`}
            >
              Auto-detection {autoDetect ? 'ON' : 'OFF'}
            </button>
            <p className="text-xs text-gray-400">Generate logs and trigger immediate investigation automatically</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Agent Status Panel</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2">
              <span className="text-gray-200">Detection Agent</span>
              <span className="text-cyan-300">Active</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2">
              <span className="text-gray-200">Investigation Agent</span>
              <span className="text-purple-300">Simulated</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              <span className="text-gray-200">Response Agent</span>
              <span className="text-emerald-300">Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass-card xl:col-span-2 overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3 text-white">Log Analysis Table</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Risk Score</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => {
                  if (analyzing) {
                    return (
                      <tr key={row.key} className="border-t border-white/5">
                        <td className="px-3 py-3" colSpan={5}><div className="h-4 w-full animate-pulse rounded bg-white/10" /></td>
                      </tr>
                    )
                  }
                  return (
                    <motion.tr
                      key={row.log.id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                      onClick={() => setSelected(row)}
                      className="cursor-pointer border-t border-white/5"
                    >
                      <td className="px-3 py-2 text-white">{row.log.username}</td>
                      <td className="px-3 py-2 text-gray-300">{row.log.action}</td>
                      <td className="px-3 py-2"><span className={`rounded-full border px-2 py-1 text-xs ${STATUS_COLORS[row.analysis.status]}`}>{row.analysis.status}</span></td>
                      <td className="px-3 py-2 text-gray-100">{row.analysis.risk_score}</td>
                      <td className="max-w-sm truncate px-3 py-2 text-gray-400">{row.analysis.reason}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white"><Bot size={18} /> Explainability Panel</h2>
          {selected ? (
            <div className="space-y-3 text-sm">
              <p className="text-gray-200">{selected.log.username} · {selected.log.action}</p>
              <p className="rounded-lg border border-white/10 bg-dark-900/70 p-3 text-gray-300">{selected.analysis.reason}</p>
              <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span className="text-gray-400">Classification</span>
                <span className={selected.analysis.status === 'Attack' ? 'text-red-400' : selected.analysis.status === 'Suspicious' ? 'text-yellow-400' : 'text-emerald-400'}>{selected.analysis.status}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span className="text-gray-400">Risk Score</span>
                <span className="text-cyan-300">{selected.analysis.risk_score}/100</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a log row to view AI reasoning.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Live Threat Feed</h2>
          <div ref={feedRef} className="h-64 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-xs">
            {feed.map((item) => (
              <div key={`${item.log.id}-${item.analysis.status}`} className={`flex items-center gap-2 ${item.analysis.status === 'Attack' ? 'text-red-300' : item.analysis.status === 'Suspicious' ? 'text-yellow-300' : 'text-emerald-300'}`}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                <span>{formatLog(item.log)}</span>
              </div>
            ))}
            {!feed.length && <p className="text-gray-500">Waiting for stream...</p>}
          </div>
        </div>

        <div className="glass-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Risk Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={5}>
                  {distribution.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">User Risk Ranking</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRanking} layout="vertical" margin={{ left: 10, right: 10, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                <YAxis type="category" dataKey="user" stroke="#64748b" width={100} />
                <Tooltip />
                <Bar dataKey="risk" fill="#22d3ee" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-dark-900/60 p-4 text-xs text-gray-400">
        <div className="mb-2 flex items-center gap-2 text-cyan-300"><Activity size={14} /> Real-time log stream updated with smooth transitions and glow telemetry styling</div>
        <div className="flex items-center gap-2 text-orange-300"><AlertTriangle size={14} /> High-risk events are highlighted dramatically in red across table and terminal feed</div>
      </div>
    </div>
  )
}
