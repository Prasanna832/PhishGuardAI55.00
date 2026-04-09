import { useEffect, useState, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Shield, Sparkles, AlertTriangle, AlertCircle, X, CheckCircle2 } from 'lucide-react'
import { usersAPI } from '../../services/api'

function RiskBadge({ level }) {
  const cls = {
    Low: 'risk-badge-low',
    Medium: 'risk-badge-medium',
    High: 'risk-badge-high',
    Critical: 'bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-semibold'
  }
  return <span className={cls[level] || 'risk-badge-medium'}>{level}</span>
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [evaluationData, setEvaluationData] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAllRisk()
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async (userId) => {
    setAnalyzingId(userId)
    setEvaluationData(null)
    try {
      const res = await usersAPI.evaluateUser(userId)
      // Attach the user ID to the evaluation data so we know which row it belongs to
      setEvaluationData({ userId, ...res.data })
    } catch (err) {
      console.error('Failed to evaluate user:', err)
    } finally {
      setAnalyzingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-400" />
            User Management & Evaluation
          </h1>
          <p className="text-gray-400">Monitor employee behavior and generate AI risk assessments</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            Employee Risk Radar
          </h2>
          <span className="text-sm text-gray-500">{users.length} Total Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Action Stats</th>
                <th className="px-6 py-4 font-medium">Risk Score</th>
                <th className="px-6 py-4 font-medium">AI Assess</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user, idx) => (
                <Fragment key={user.user_id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{user.department}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between w-32">
                          <span className="text-gray-500">Links Clicked:</span>
                          <span className={user.clicks > 0 ? "text-red-400 font-medium" : "text-gray-400"}>{user.clicks}</span>
                        </div>
                        <div className="flex justify-between w-32">
                          <span className="text-gray-500">Reported:</span>
                          <span className={user.reports > 0 ? "text-emerald-400 font-medium" : "text-gray-400"}>{user.reports}</span>
                        </div>
                        <div className="flex justify-between w-32">
                          <span className="text-gray-500">Training:</span>
                          <span className="text-cyan-400 font-medium">{user.completed_trainings}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 align-start">
                        <RiskBadge level={user.risk_level} />
                        <span className="text-xs text-gray-500">{Math.round(user.risk_score)} / 100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEvaluate(user.user_id)}
                        disabled={analyzingId === user.user_id}
                        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-none relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-shadow"
                      >
                        {analyzingId === user.user_id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            AI Evaluate
                          </>
                        )}
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                      </button>
                    </td>
                  </motion.tr>

                  {/* Evaluation Result Dropdown */}
                  <AnimatePresence>
                    {evaluationData && evaluationData.userId === user.user_id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan="5" className="p-0 border-b border-emerald-500/20">
                          <div className="bg-emerald-900/10 p-6 relative">
                            <button 
                              onClick={() => setEvaluationData(null)}
                              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                              <X size={16} />
                            </button>
                            
                            <div className="flex items-start gap-4">
                              <div className="mt-1 bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30 flex-shrink-0">
                                <Sparkles className="text-emerald-400 w-6 h-6" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-white font-semibold">AI Behavioral Assessment</h3>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    evaluationData.classification.includes('Critical') 
                                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                      : evaluationData.classification.includes('Monitor')
                                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  }`}>
                                    {evaluationData.classification}
                                  </span>
                                </div>
                                
                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                  {evaluationData.summary}
                                </p>

                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended HR Actions</h4>
                                  <ul className="space-y-1.5">
                                    {evaluationData.recommended_actions.map((action, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                        <div className="mt-0.5 text-emerald-500">
                                          {evaluationData.classification.includes('Critical') ? (
                                            <AlertCircle size={14} className="text-red-400" />
                                          ) : evaluationData.classification.includes('Good') ? (
                                            <CheckCircle2 size={14} className="text-emerald-400" />
                                          ) : (
                                            <AlertTriangle size={14} className="text-yellow-400" />
                                          )}
                                        </div>
                                        {action}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-8 w-8 mb-3 opacity-20" />
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
