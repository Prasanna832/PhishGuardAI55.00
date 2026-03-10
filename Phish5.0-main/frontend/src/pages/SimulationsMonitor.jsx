import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Users, Clock, ChevronRight, Send, BarChart2 } from 'lucide-react'
import { simulationsAPI, usersAPI } from '../services/api'

function ResultsModal({ simulation, onClose }) {

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const loadResults = () => {
    simulationsAPI.getResults(simulation.id)
      .then(r => setResults(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadResults()
  }, [simulation.id])

  const handleInteraction = async (action) => {
    setActionLoading(true)

    try {
      await simulationsAPI.interact({
        simulation_id: simulation.id,
        action: action
      })

      loadResults()

      if (action === "clicked") {
        alert("⚠ You clicked the phishing email. AI training has been assigned.")
      }

      if (action === "reported") {
        alert("✅ Good job! You reported the phishing email.")
      }

    } catch (err) {
      console.error(err)
    }

    setActionLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md p-6"
      >

        <h3 className="text-white font-bold text-lg mb-1">
          {simulation.subject}
        </h3>

        <p className="text-gray-400 text-sm mb-5">
          {simulation.department} · {simulation.simulation_type}
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : results ? (

          <div className="space-y-4">

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-cyan-400">{results.total_sent}</div>
                <div className="text-xs text-gray-500">Sent</div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-red-400">{results.clicked}</div>
                <div className="text-xs text-gray-500">Clicked</div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">{results.reported}</div>
                <div className="text-xs text-gray-500">Reported</div>
              </div>
            </div>


            <div className="space-y-2">

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Click Rate</span>
                <span className="text-red-400 font-medium">{results.click_rate}%</span>
              </div>

              <div className="w-full bg-dark-700 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full"
                  style={{ width: `${results.click_rate}%` }}
                />
              </div>


              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Report Rate</span>
                <span className="text-emerald-400 font-medium">{results.report_rate}%</span>
              </div>

              <div className="w-full bg-dark-700 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${results.report_rate}%` }}
                />
              </div>

            </div>


            <div className="flex gap-3 pt-2">

              <button
                onClick={() => handleInteraction("clicked")}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                🔴 Click Phish
              </button>

              <button
                onClick={() => handleInteraction("reported")}
                disabled={actionLoading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                🟢 Report Phish
              </button>

            </div>

          </div>

        ) : (
          <p className="text-gray-500 text-center py-4">
            No results available yet
          </p>
        )}

        <button
          onClick={onClose}
          className="btn-secondary w-full mt-5"
        >
          Close
        </button>

      </motion.div>
    </motion.div>
  )
}

export default function SimulationsMonitor() {

  const [simulations, setSimulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSim, setSelectedSim] = useState(null)
  const [sending, setSending] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    Promise.all([simulationsAPI.list(), usersAPI.list()])
      .then(([simRes, userRes]) => {
        setSimulations(simRes.data)
        setUsers(userRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSend = async (simId) => {

    if (users.length === 0) return

    setSending(simId)

    try {

      const userIds = users.map(u => u.id)

      await simulationsAPI.send({
        simulation_id: simId,
        target_user_ids: userIds
      })

      alert(`Simulation sent to ${userIds.length} users!`)

    } catch (err) {
      console.error(err)
    }

    setSending(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (

    <div>

      <h1 className="page-header">Simulations Monitor</h1>
      <p className="page-subtitle">
        Track and manage phishing simulation campaigns
      </p>

      {simulations.length === 0 ? (

        <div className="glass-card p-12 text-center">
          <Target size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-white font-semibold mb-2">No Simulations Yet</h3>
          <p className="text-gray-500 mb-4">
            Generate your first phishing simulation to get started
          </p>

          <a
            href="/simulations/generate"
            className="btn-primary inline-flex items-center gap-2"
          >
            Generate Simulation <ChevronRight size={16} />
          </a>

        </div>

      ) : (

        <div className="space-y-4">

          {simulations.map((sim, i) => (

            <motion.div
              key={sim.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover:border-cyan-500/20 transition-all"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {sim.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">

                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {sim.department}
                    </span>

                    <span className="flex items-center gap-1">
                      <Target size={12} />
                      {sim.simulation_type}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(sim.created_at).toLocaleDateString()}
                    </span>

                  </div>

                </div>

                <div className="flex items-center gap-2 flex-shrink-0">

                  <button
                    onClick={() => setSelectedSim(sim)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
                  >
                    <BarChart2 size={14} />
                    Results
                  </button>

                  <button
                    onClick={() => handleSend(sim.id)}
                    disabled={sending === sim.id}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-all disabled:opacity-50"
                  >
                    {sending === sim.id ? (
                      <div className="w-3 h-3 border border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Send
                  </button>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      )}

      <AnimatePresence>
        {selectedSim && (
          <ResultsModal
            simulation={selectedSim}
            onClose={() => setSelectedSim(null)}
          />
        )}
      </AnimatePresence>

    </div>
  )
}