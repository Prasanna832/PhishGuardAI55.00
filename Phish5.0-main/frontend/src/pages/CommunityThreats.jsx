import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Send, Clock, Shield, Globe, Tag, ChevronDown } from 'lucide-react'
import { threatsAPI } from '../services/api'

const CATEGORIES = [
  'Bank Verification Scam', 'Payroll Update Scam', 'Delivery Fraud',
  'Job Offer Scam', 'Tech Support Scam', 'CEO Fraud', 'Account Verification',
  'IT Password Reset', 'Prize/Lottery Scam', 'Uncategorized',
]

const SEVERITIES = [
  { id: 'low', label: 'Low', color: 'text-emerald-400' },
  { id: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { id: 'high', label: 'High', color: 'text-orange-400' },
  { id: 'critical', label: 'Critical', color: 'text-red-400' },
]

function SeverityBadge({ severity }) {
  const s = SEVERITIES.find(s => s.id === severity) || SEVERITIES[1]
  const colors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[severity] || colors.medium} capitalize`}>
      {severity}
    </span>
  )
}

export default function CommunityThreats() {
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    email_content: '',
    category: 'Uncategorized',
    subject: '',
    sender_domain: '',
    severity: 'medium',
  })

  const fetchData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        threatsAPI.list(),
        threatsAPI.getStats(),
      ])
      setReports(reportsRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await threatsAPI.submit(form)
      setSuccess(true)
      setForm({ email_content: '', category: 'Uncategorized', subject: '', sender_domain: '', severity: 'medium' })
      await fetchData()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <h1 className="page-header">Community Threat Sharing</h1>
      <p className="page-subtitle">Collaborative phishing defense — report threats to protect the community</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Submit Report */}
        <div className="space-y-5">
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-400" />
              Report a Phishing Threat
            </h3>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm"
              >
                <Shield size={16} />
                Report submitted! Thank you for helping protect the community.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email Subject</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Email subject line"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Sender Domain</label>
                  <input
                    value={form.sender_domain}
                    onChange={(e) => setForm(f => ({ ...f, sender_domain: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="e.g. suspicious.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="input-field text-sm appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm(f => ({ ...f, severity: e.target.value }))}
                    className="input-field text-sm appearance-none"
                  >
                    {SEVERITIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Email Content <span className="text-gray-600">(will be anonymized)</span>
                </label>
                <textarea
                  value={form.email_content}
                  onChange={(e) => setForm(f => ({ ...f, email_content: e.target.value }))}
                  className="w-full bg-dark-700/50 border border-white/10 rounded-lg p-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                  rows={6}
                  placeholder="Paste the phishing email content here..."
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Submitting...</>
                ) : (
                  <><Send size={16} />Submit Threat Report</>
                )}
              </motion.button>
            </form>
          </div>

          {/* Community Stats */}
          {stats && (
            <div className="glass-card p-5">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Community Statistics</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{stats.total_reports}</div>
                  <div className="text-xs text-gray-400">Total Reports</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.top_categories?.length || 0}</div>
                  <div className="text-xs text-gray-400">Categories</div>
                </div>
              </div>
              {stats.top_categories?.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Top Threats</div>
                  <div className="space-y-2">
                    {stats.top_categories.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{c.name}</span>
                        <span className="text-cyan-400 font-medium">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Community Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Globe size={18} className="text-cyan-400" />
              Community Threat Feed
            </h3>
            <span className="text-xs text-gray-500">{reports.length} reports</span>
          </div>

          {reports.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Globe size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">No threat reports yet. Be the first to submit!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {reports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag size={10} />
                        {report.category}
                      </span>
                      <SeverityBadge severity={report.severity} />
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                      <Clock size={10} />
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {report.subject && (
                    <div className="text-sm text-gray-200 font-medium mb-1">
                      Subject: {report.subject}
                    </div>
                  )}
                  {report.sender_domain && (
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Globe size={10} />
                      Domain: {report.sender_domain}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
