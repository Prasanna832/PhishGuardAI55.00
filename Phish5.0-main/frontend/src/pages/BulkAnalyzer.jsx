import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Shield, AlertTriangle, CheckCircle, XCircle,
  Download, Trash2, Play, BarChart3, Search
} from 'lucide-react'
import CountUp from 'react-countup'
import { bulkAnalyzerAPI } from '../services/api'

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const results = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const idx = line.indexOf(',')
    if (idx === -1) {
      results.push({ email_id: String(i), email_content: line })
    } else {
      results.push({
        email_id: line.substring(0, idx).trim(),
        email_content: line.substring(idx + 1).trim().replace(/^"|"$/g, ''),
      })
    }
  }
  return results
}

const riskBadge = {
  Safe: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Suspicious: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Phishing: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const riskIcon = {
  Safe: CheckCircle,
  Suspicious: AlertTriangle,
  Phishing: XCircle,
}

export default function BulkAnalyzer() {
  const [inputMode, setInputMode] = useState('paste') // 'paste' or 'csv'
  const [pasteContent, setPasteContent] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      setCsvFile(file)
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) setCsvFile(file)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setResults(null)
    setProgress(0)

    try {
      let emails = []
      if (inputMode === 'paste') {
        const lines = pasteContent.trim().split('\n\n').filter(Boolean)
        emails = lines.map((content, i) => ({
          email_id: `email_${i + 1}`,
          email_content: content.trim(),
        }))
      } else if (csvFile) {
        const text = await csvFile.text()
        emails = parseCSV(text)
      }

      if (emails.length === 0) {
        setError('No emails to analyze. Please paste emails or upload a CSV file.')
        setLoading(false)
        return
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 15, 90))
      }, 400)

      const res = await bulkAnalyzerAPI.analyze(emails)
      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        setResults(res.data)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Bulk analysis failed. Please try again.')
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    try {
      const res = await bulkAnalyzerAPI.downloadReport()
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'phishguard_bulk_report.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download report.')
    }
  }

  const handleReset = () => {
    setResults(null)
    setPasteContent('')
    setCsvFile(null)
    setProgress(0)
    setError('')
  }

  return (
    <div>
      <h1 className="page-header">Bulk Email Analyzer</h1>
      <p className="page-subtitle">Analyze multiple emails at once with AI-powered threat detection and generate security reports</p>

      {!results && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Mode Toggle */}
          <div className="glass-card p-4">
            <div className="flex gap-3">
              {[
                { id: 'paste', label: 'Paste Emails', desc: 'Paste multiple emails separated by blank lines', icon: FileText },
                { id: 'csv', label: 'Upload CSV', desc: 'Upload a CSV file with email_id,email_content', icon: Upload },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setInputMode(m.id)}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    inputMode === m.id
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <m.icon size={20} />
                  <div className="text-left">
                    <div>{m.label}</div>
                    <div className="text-xs opacity-60">{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          {inputMode === 'paste' ? (
            <div className="glass-card p-5">
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <FileText size={14} />
                Paste Emails (separate each email with a blank line)
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-lg p-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                rows={14}
                placeholder={"Dear user, verify your account immediately...\n\nHello, your package delivery failed...\n\nHi team, please review the attached document..."}
              />
            </div>
          ) : (
            <div
              className={`glass-card p-8 border-2 border-dashed transition-all duration-300 ${
                dragOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  dragOver ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/5 border-white/10'
                } border`}>
                  <Upload size={28} className={dragOver ? 'text-cyan-400' : 'text-gray-400'} />
                </div>
                {csvFile ? (
                  <div className="flex items-center gap-3">
                    <FileText className="text-cyan-400" size={20} />
                    <span className="text-white font-medium">{csvFile.name}</span>
                    <button onClick={() => setCsvFile(null)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-gray-300 font-medium">Drag & drop your CSV file here</p>
                      <p className="text-gray-500 text-sm mt-1">or click to browse</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all"
                    >
                      Browse Files
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <p className="text-gray-600 text-xs">Format: email_id,email_content</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2 px-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <motion.button
            onClick={handleAnalyze}
            disabled={inputMode === 'paste' ? !pasteContent.trim() : !csvFile}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            Start Bulk Analysis
          </motion.button>
        </motion.div>
      )}

      {/* Loading / Progress */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 flex items-center justify-center">
              <Search className="text-cyan-400" size={32} />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <div className="text-cyan-400 font-semibold text-lg">Scanning Emails</div>
            <div className="text-gray-500 text-sm mt-1">AI analysis in progress...</div>
          </div>
          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div className="space-y-1">
            {['Parsing email contents', 'Running AI classification', 'Detecting phishing patterns', 'Computing risk scores'].map((item, i) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Analyzed', value: results.summary.total_analyzed, borderClass: 'border-cyan-500/20', iconClass: 'text-cyan-400', valueClass: 'text-cyan-400', icon: BarChart3 },
                { label: 'Phishing', value: results.summary.phishing, borderClass: 'border-red-500/20', iconClass: 'text-red-400', valueClass: 'text-red-400', icon: XCircle },
                { label: 'Suspicious', value: results.summary.suspicious, borderClass: 'border-yellow-500/20', iconClass: 'text-yellow-400', valueClass: 'text-yellow-400', icon: AlertTriangle },
                { label: 'Safe', value: results.summary.safe, borderClass: 'border-emerald-500/20', iconClass: 'text-emerald-400', valueClass: 'text-emerald-400', icon: CheckCircle },
                { label: 'Avg Trust', value: results.summary.average_trust_score, borderClass: 'border-blue-500/20', iconClass: 'text-blue-400', valueClass: 'text-blue-400', icon: Shield, suffix: '%' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass-card p-4 border ${s.borderClass}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{s.label}</span>
                    <s.icon size={16} className={s.iconClass} />
                  </div>
                  <div className={`text-2xl font-bold ${s.valueClass}`}>
                    <CountUp end={s.value} duration={1.5} decimals={s.label === 'Avg Trust' ? 1 : 0} />
                    {s.suffix || ''}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleDownloadReport}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all"
              >
                <Download size={16} />
                Download Report
              </motion.button>
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:text-white hover:bg-white/10 transition-all"
              >
                <Trash2 size={16} />
                New Analysis
              </motion.button>
            </div>

            {/* Results Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium px-4 py-3">#</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Classification</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Trust Score</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Risk Level</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Detected Techniques</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((r, i) => {
                      const Icon = riskIcon[r.classification] || AlertTriangle
                      let phrases = []
                      try { phrases = JSON.parse(r.suspicious_phrases || '[]') } catch { phrases = [] }
                      return (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${riskBadge[r.classification] || riskBadge.Suspicious}`}>
                              <Icon size={12} />
                              {r.classification}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    r.trust_score >= 70 ? 'bg-emerald-500' : r.trust_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${r.trust_score}%` }}
                                />
                              </div>
                              <span className="text-white font-medium">{Math.round(r.trust_score)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${
                              r.risk_level === 'Critical' ? 'text-red-400' :
                              r.risk_level === 'High' ? 'text-orange-400' :
                              r.risk_level === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'
                            }`}>
                              {r.risk_level}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {phrases.length > 0 ? phrases.slice(0, 3).map((p, j) => (
                                <span key={j} className="bg-orange-500/10 text-orange-300 border border-orange-500/20 px-1.5 py-0.5 rounded text-xs">
                                  {p}
                                </span>
                              )) : (
                                <span className="text-gray-600 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-400 text-xs line-clamp-2 max-w-sm group-hover:text-gray-300 transition-colors">
                              {r.analysis_explanation}
                            </p>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
