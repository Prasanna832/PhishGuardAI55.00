import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Search, Shield, AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { analyzerAPI } from '../services/api'

const riskColors = {
  Safe: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: CheckCircle },
  Suspicious: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: AlertTriangle },
  Phishing: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400', icon: XCircle },
}

function RiskGauge({ trustScore }) {
  const angle = (trustScore / 100) * 180 - 90
  const color = trustScore >= 70 ? '#10b981' : trustScore >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
          {/* Colored arc based on score */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(trustScore / 100) * 251.2} 251.2`}
            opacity="0.8"
          />
          {/* Needle */}
          <line
            x1="100" y1="100"
            x2={100 + 70 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={100 + 70 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={color} />
          <text x="25" y="98" fill="#6b7280" fontSize="11">0</text>
          <text x="170" y="98" fill="#6b7280" fontSize="11">100</text>
        </svg>
      </div>
      <div className="text-2xl font-bold mt-1" style={{ color }}>{trustScore}</div>
      <div className="text-xs text-gray-400">Trust Score</div>
    </div>
  )
}

export default function EmailAnalyzer() {
  const [emailContent, setEmailContent] = useState('')
  const [mode, setMode] = useState('enterprise')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFullExplanation, setShowFullExplanation] = useState(false)

  const handleAnalyze = async () => {
    if (!emailContent.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await analyzerAPI.analyze(emailContent, mode)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const colors = result ? (riskColors[result.classification] || riskColors.Suspicious) : null

  return (
    <div>
      <h1 className="page-header">AI Email Phishing Analyzer</h1>
      <p className="page-subtitle">Paste any suspicious email and get instant AI-powered threat analysis</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Analysis Mode</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'enterprise', label: 'Enterprise', desc: 'Technical analysis' },
                { id: 'vulnerable_user', label: 'Simple Mode', desc: 'For non-technical users' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    mode === m.id
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div>{m.label}</div>
                  <div className="text-xs opacity-60">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="glass-card p-5">
            <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Mail size={14} />
              Email Content
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="w-full bg-dark-700/50 border border-white/10 rounded-lg p-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
              rows={12}
              placeholder="Paste the full email content here including headers, subject, and body..."
            />

            {error && (
              <div className="mt-3 text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <motion.button
              onClick={handleAnalyze}
              disabled={loading || !emailContent.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Analyzing Email...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Analyze Email
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {loading && (
            <div className="glass-card p-8 flex flex-col items-center justify-center gap-4 h-full min-h-64">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 flex items-center justify-center">
                  <Shield className="text-cyan-400" size={32} />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-medium">Scanning Email</div>
                <div className="text-gray-500 text-sm mt-1">AI analysis in progress...</div>
              </div>
              {/* Scan animation bars */}
              <div className="w-48 space-y-1">
                {['Checking headers', 'Analyzing links', 'Detecting patterns', 'Scoring risk'].map((item, i) => (
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
            </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Classification Banner */}
                <div className={`glass-card p-5 border ${colors.border} ${colors.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {<colors.icon size={24} className={colors.text} />}
                      <div>
                        <div className={`text-xl font-bold ${colors.text}`}>{result.classification}</div>
                        <div className="text-gray-400 text-sm">Risk Level: {result.risk_level}</div>
                      </div>
                    </div>
                    <RiskGauge trustScore={result.trust_score} />
                  </div>
                </div>

                {/* Social Engineering Techniques */}
                {result.detected_social_engineering_techniques?.length > 0 && (
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-orange-400" />
                      Social Engineering Techniques
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.detected_social_engineering_techniques.map((t, i) => (
                        <span key={i} className="bg-orange-500/15 text-orange-300 border border-orange-500/30 px-2.5 py-1 rounded-full text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suspicious Phrases */}
                {result.suspicious_phrases?.length > 0 && (
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <XCircle size={14} className="text-red-400" />
                      Suspicious Phrases Detected
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.suspicious_phrases.map((p, i) => (
                        <span key={i} className="bg-red-500/10 text-red-300 border border-red-500/20 px-2.5 py-1 rounded text-xs font-mono">
                          "{p}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Explanation */}
                <div className="glass-card p-5">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Info size={14} className="text-cyan-400" />
                    AI Analysis
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
                  {result.awareness_coach && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowFullExplanation(!showFullExplanation)}
                        className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                      >
                        Awareness Coach {showFullExplanation ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      <AnimatePresence>
                        {showFullExplanation && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-gray-400 text-sm leading-relaxed mt-2 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
                              {result.awareness_coach}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Prevention Advice */}
                {result.prevention_advice?.length > 0 && (
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Shield size={14} className="text-emerald-400" />
                      Prevention Advice
                    </h4>
                    <ul className="space-y-2">
                      {result.prevention_advice.map((advice, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3 min-h-64">
              <Mail size={40} className="text-gray-600" />
              <p className="text-gray-500">Paste an email and click Analyze to get AI-powered threat analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
