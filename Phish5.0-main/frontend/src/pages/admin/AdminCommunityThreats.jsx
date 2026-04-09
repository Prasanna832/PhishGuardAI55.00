import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Globe, Tag, Clock, ShieldAlert, Sparkles, ChevronDown, CheckCircle, Flame } from 'lucide-react'
import { threatsAPI } from '../../services/api'
// Import useAuth if needed, or other components

const SEVERITIES = [
  { id: 'low', label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'high', label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'critical', label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10' },
]

function SeverityBadge({ severity }) {
  const s = SEVERITIES.find(x => x.id === severity) || SEVERITIES[1]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border border-white/10 ${s.bg} ${s.color} capitalize font-medium flex items-center gap-1`}>
      {severity === 'critical' && <Flame size={10} />}
      {severity}
    </span>
  )
}

export default function AdminCommunityThreats() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [analysisResults, setAnalysisResults] = useState({})

  const fetchReports = async () => {
    try {
      const res = await threatsAPI.list()
      setReports(res.data)
    } catch (err) {
      console.error("Error fetching reports", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleAnalyze = async (id) => {
    setAnalyzingId(id)
    try {
      const res = await threatsAPI.analyze(id) 
      setAnalysisResults(prev => ({
        ...prev,
        [id]: res.data
      }))
    } catch (err) {
      console.error("Error analyzing threat", err)
    } finally {
      setAnalyzingId(null)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="text-emerald-400" />
          Community Threats Analysis
        </h1>
        <p className="text-gray-400 mt-1">Review user-submitted phishing reports and generate AI insights for the organization.</p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No Threats Reported</h3>
            <p className="text-gray-400 text-sm">The community feed is currently clear.</p>
          </div>
        ) : (
          reports.map((report) => {
            const isAnalyzing = analyzingId === report.id
            const result = analysisResults[report.id]

            return (
              <motion.div 
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
              >
                <div className="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag size={10} /> {report.category}
                      </span>
                      <SeverityBadge severity={report.severity} />
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white">{report.subject || 'No Subject Provided'}</h3>
                    {report.sender_domain && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <Globe size={14} /> {report.sender_domain}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {!result && (
                      <button 
                        onClick={() => handleAnalyze(report.id)}
                        disabled={isAnalyzing}
                        className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-gradient-to-r from-emerald-500 to-teal-500 text-black border-none disabled:opacity-70"
                      >
                        {isAnalyzing ? (
                          <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles size={16} /> AI Analyze</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Analysis Result Section */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-dark-800/80 p-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                      
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                          <Sparkles className="text-emerald-400 w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-white font-medium">AI Threat Summary</h4>
                            <span className={`text-xs px-2 py-0.5 rounded bg-dark-900 border ${result.risk_level === 'Critical' ? 'border-red-500/50 text-red-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                              Risk: {result.risk_level}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
                        </div>
                      </div>

                      {result.prevention_advice && result.prevention_advice.length > 0 && (
                        <div className="ml-14 bg-dark-900/50 rounded-lg border border-white/5 p-4">
                          <h5 className="text-xs font-semibold uppercase text-emerald-400 mb-2 flex items-center gap-2">
                            <CheckCircle size={14} /> Action Required
                          </h5>
                          <ul className="space-y-2">
                            {result.prevention_advice.map((advice, i) => (
                              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                <span className="text-emerald-500/50 mt-0.5">•</span>
                                {advice}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
