import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Users, Clock, ChevronRight, Send, BarChart2, ShieldAlert } from 'lucide-react'
import { simulationsAPI, usersAPI } from '../../services/api'

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

  const handleInteraction = async (action) => {
    setActionLoading(true)
    try {
      await simulationsAPI.interact({
        simulation_id: simulation.id,
        action: action
      })
      loadResults()
      if (action === "clicked") {
        alert("Simulated Employee Click Executed. A new AI Bootcamp has been generated in the User Training Center.")
      }
      if (action === "reported") {
        alert("Simulated Employee Report Executed. Telemetry updated.")
      }
    } catch (err) {
      console.error(err)
      alert("Error: Could not process interaction. Ensure the AI service is responsive.")
    }
    setActionLoading(false)
  }

  useEffect(() => {
    loadResults()
  }, [simulation.id])

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
        className="glass-card w-full max-w-md p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
      >

        <h3 className="text-white font-bold text-lg mb-1">
          {simulation.subject}
        </h3>

        <p className="text-gray-400 text-sm mb-5 font-mono">
          {simulation.department} · {simulation.simulation_type}
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : results ? (

          <div className="space-y-6">
            { (() => {
               const hasData = results.total_sent > 0 || results.clicked > 0 || results.reported > 0;
               return (
                 <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-700/50 border border-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{results.total_sent}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Sent</div>
              </div>

              <div className="bg-dark-700/50 border border-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{results.clicked}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Phished</div>
              </div>

              <div className="bg-dark-700/50 border border-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{results.reported}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Reported</div>
              </div>
            </div>


            <div className="space-y-4">

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-400">Vulnerability Rate (Clicked)</span>
                  <span className="text-red-400 font-bold">
                    {!hasData ? "N/A" : `${results.click_rate}%`}
                  </span>
                </div>

                <div className="w-full bg-dark-800 rounded-full h-2 relative">
                  {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest z-10 w-full text-center">
                       Awaiting Deployment Data
                    </div>
                  )}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.click_rate}%` }}
                    transition={{ duration: 1 }}
                    className={`h-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] ${!hasData ? 'bg-dark-600' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                  />
                </div>
              </div>


              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-400">Detection Rate (Reported)</span>
                  <span className="text-emerald-400 font-bold">
                     {!hasData ? "N/A" : `${results.report_rate}%`}
                  </span>
                </div>

                <div className="w-full bg-dark-800 rounded-full h-2 relative">
                  {!hasData && (
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest z-10 w-full text-center">
                       Awaiting Deployment Data
                     </div>
                   )}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.report_rate}%` }}
                    transition={{ duration: 1 }}
                    className={`h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${!hasData ? 'bg-dark-600' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}
                  />
                </div>
              </div>

            </div>
                 </>
               )
            })()}
          </div>

        ) : (
          <p className="text-gray-500 text-center py-4">
            No telemetry data available. Deploy simulation to gather results.
          </p>
        )}

        <div className="mt-8 border-t border-white/10 pt-6">
          <h4 className="text-white text-sm font-semibold mb-3">Admin Testing Tools</h4>
          <p className="text-gray-400 text-xs mb-4">
            Simulate employee actions to generate AI Bootcamp Reports for review.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleInteraction("clicked")}
              disabled={actionLoading}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "[Simulate Click]"}
            </button>
            <button
              onClick={() => handleInteraction("reported")}
              disabled={actionLoading}
              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "[Simulate Report]"}
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">
             After simulating a click, check the <a href="/training" className="text-cyan-400 hover:underline">User Training Center</a> to preview the AI Bootcamp Report.
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-secondary w-full mt-6 bg-dark-700 hover:bg-dark-600"
        >
          Close Telemetry
        </button>

      </motion.div>
    </motion.div>
  )
}

export default function AdminSimulations() {

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
      alert(`Simulation payload deployed to ${userIds.length} targets!`)
    } catch (err) {
      console.error(err)
    }

    setSending(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (

    <div className="max-w-6xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-cyan-400" />
            Simulation Command Center
          </h1>
          <p className="text-gray-400">
            Deploy AI-generated phishing campaigns and monitor real-time organizational vulnerability
          </p>
        </div>
        <a
          href="/ai-campaign-generator"
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
        >
          Generate New <ChevronRight size={16} />
        </a>
      </div>

      {simulations.length === 0 ? (

        <div className="glass-card p-16 text-center border border-white/5">
          <Target size={64} className="mx-auto mb-6 text-gray-700" />
          <h3 className="text-xl text-white font-bold mb-3">No Active Simulations</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your simulation database is currently empty. Use the AI Campaign Generator to create realistic phishing scenarios.
          </p>

          <a
            href="/ai-campaign-generator"
            className="btn-primary inline-flex items-center gap-2"
          >
            Launch Generator <ChevronRight size={16} />
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
              className="glass-card p-6 border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
            >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg text-white font-bold truncate">
                      {sim.subject}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-dark-800 text-gray-400 border border-white/10">
                      ID: #{sim.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">

                    <span className="flex items-center gap-1.5 font-medium">
                      <Target size={14} className="text-purple-400" />
                      {sim.simulation_type.charAt(0).toUpperCase() + sim.simulation_type.slice(1)}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-cyan-400" />
                      {sim.department}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-400" />
                      {new Date(sim.created_at).toLocaleDateString()}
                    </span>

                  </div>

                </div>

                <div className="flex items-center gap-3 flex-shrink-0">

                  <button
                    onClick={() => setSelectedSim(sim)}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white border border-white/10 transition-all"
                  >
                    <BarChart2 size={16} className="text-cyan-400" />
                    Telemetry
                  </button>

                  <button
                    onClick={() => handleSend(sim.id)}
                    disabled={sending === sim.id}
                    className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 font-bold border border-cyan-500/30 transition-all disabled:opacity-50 min-w-[120px] justify-center shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  >
                    {sending === sim.id ? (
                      <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Deploy Threat
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
