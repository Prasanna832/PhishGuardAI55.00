import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, Building, Users, Tag, ChevronRight, CheckCircle, Copy } from 'lucide-react'
import { simulationsAPI } from '../services/api'

const SIMULATION_TYPES = [
  { id: 'account verification', label: 'Account Verification', icon: '🔐', desc: 'Fake account suspension/verification' },
  { id: 'payroll update', label: 'Payroll Update', icon: '💰', desc: 'Fake payroll/HR system update' },
  { id: 'it password reset', label: 'IT Password Reset', icon: '🔑', desc: 'Fake IT helpdesk password expiry' },
  { id: 'ceo fraud', label: 'CEO Fraud', icon: '👔', desc: 'Impersonation of executive' },
  { id: 'delivery scam', label: 'Delivery Scam', icon: '📦', desc: 'Fake package delivery notice' },
]

const DEPARTMENTS = ['All Employees', 'IT', 'Finance', 'HR', 'Operations', 'Marketing', 'Legal', 'Sales', 'Engineering']

export default function SimulationGenerator() {
  const [form, setForm] = useState({
    company_name: '',
    department: 'All Employees',
    simulation_type: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!form.company_name || !form.simulation_type) {
      setError('Please fill in all fields and select a simulation type')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await simulationsAPI.generate(form)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const copyEmail = () => {
    if (result) {
      navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <h1 className="page-header">Phishing Simulation Generator</h1>
      <p className="page-subtitle">Generate realistic AI-powered phishing simulations for employee training</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-5">
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <Building size={18} className="text-cyan-400" />
              Target Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Company Name</label>
                <input
                  value={form.company_name}
                  onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Acme Corporation"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Users size={14} />
                  Target Department
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                  className="input-field appearance-none"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Simulation Type */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Tag size={18} className="text-purple-400" />
              Simulation Type
            </h3>
            <div className="space-y-2">
              {SIMULATION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setForm(f => ({ ...f, simulation_type: type.id }))}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                    form.simulation_type === type.id
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                      : 'border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{type.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.desc}</div>
                      </div>
                    </div>
                    {form.simulation_type === type.id && (
                      <CheckCircle size={16} className="text-cyan-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <motion.button
            onClick={handleGenerate}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Zap size={16} />
                Generate Simulation
                <ChevronRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        {/* Generated Email Preview */}
        <div>
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Target size={18} className="text-cyan-400" />
                    Generated Simulation
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Saved to DB
                    </span>
                    <button
                      onClick={copyEmail}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                      title="Copy email"
                    >
                      {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Email preview */}
                <div className="bg-dark-700/50 rounded-lg border border-white/10 overflow-hidden">
                  <div className="p-3 border-b border-white/10 space-y-1">
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500 w-16">FROM:</span>
                      <span className="text-gray-300">noreply@{form.company_name?.toLowerCase().replace(/\s+/g, '') || 'company'}-security.net</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500 w-16">TO:</span>
                      <span className="text-gray-300">{form.department} Team</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500 w-16">SUBJECT:</span>
                      <span className="text-white font-medium">{result.subject}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <pre className="text-gray-300 text-sm font-sans whitespace-pre-wrap leading-relaxed">
                      {result.body.replace('[PHISHING_LINK]', '🔗 [Simulated Phishing Link]')}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Simulation ID: #{result.id}
                </div>
                <p className="text-xs text-gray-400">
                  This simulation has been saved and can be sent to employees from the Simulations Monitor page.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3 h-full min-h-64">
              <Target size={40} className="text-gray-600" />
              <p className="text-gray-500">Fill in the configuration and generate a realistic phishing simulation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
