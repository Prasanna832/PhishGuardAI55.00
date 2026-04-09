import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle, Clock, Award, ChevronDown, ChevronUp, Zap, AlertTriangle, Shield, Crosshair } from 'lucide-react'
import { trainingAPI } from '../services/api'

function TrainingCard({ training, onComplete }) {
  const [expanded, setExpanded] = useState(false)
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await onComplete(training.id)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card overflow-hidden border transition-all duration-300 ${
        training.completed ? 'border-emerald-500/20' : 'border-white/10 hover:border-cyan-500/20'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              training.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {training.completed ? <CheckCircle size={16} /> : <BookOpen size={16} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{training.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Clock size={10} />
                {new Date(training.created_at).toLocaleDateString()}
                {training.completed && training.completed_at && (
                  <span className="text-emerald-400"> · Completed {new Date(training.completed_at).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {training.completed ? (
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Completed
              </span>
            ) : (
              <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                Pending
              </span>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 space-y-4 pt-4 border-t border-white/5">
                {training.mistake_description && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                       <Zap size={16} /> Action Analysis
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-mono">{training.mistake_description}</p>
                  </div>
                )}
                
                {training.why_dangerous && (
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
                       <AlertTriangle size={16} /> Threat Assessment
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{training.why_dangerous}</p>
                  </div>
                )}

                {training.prevention_tips && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                       <Shield size={16} /> Prevention Protocol
                    </div>
                    <div className="space-y-2">
                      {training.prevention_tips.split('\n').filter(Boolean).map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-300 bg-dark-800/50 p-3 rounded border border-white/5">
                          <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="leading-snug">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!training.completed && (
                  <motion.button
                    onClick={handleComplete}
                    disabled={completing}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all"
                  >
                    {completing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Award size={18} />
                        Acknowledge & Complete Bootcamp Module
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function TrainingCenter() {
  const [trainings, setTrainings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [trainRes, statsRes] = await Promise.all([
        trainingAPI.list(),
        trainingAPI.getStats(),
      ])
      setTrainings(trainRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleComplete = async (id) => {
    await trainingAPI.complete(id)
    await fetchData()
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Crosshair className="text-cyan-400" size={32} />
        AI Security Bootcamp
      </h1>
      <p className="text-gray-400 mb-8 border-b border-white/10 pb-6">
        Personalized incident reports and security awareness training based on your simulated performance.
      </p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Modules', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Completion Rate', value: `${stats.completion_rate}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-4 ${s.bg} border border-white/5`}
            >
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {stats && stats.total > 0 && (
        <div className="glass-card p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm text-cyan-400 font-medium">{stats.completion_rate}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completion_rate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Training Modules */}
      {trainings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-white font-semibold mb-2">No Training Modules Yet</h3>
          <p className="text-gray-500">Training modules are automatically generated when you interact with simulations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((training) => (
            <TrainingCard key={training.id} training={training} onComplete={handleComplete} />
          ))}
        </div>
      )}
    </div>
  )
}
