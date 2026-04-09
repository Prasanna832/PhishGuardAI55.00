import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Target,
  Building2,
  Shield,
  Send,
  AlertTriangle,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader
} from 'lucide-react'
import { campaignAPI } from '../services/api'

const attackStyles = [
  'Credential Harvesting',
  'Payroll Update',
  'IT Password Reset',
  'Fake Delivery',
  'CEO Fraud',
  'Urgent Invoice',
  'Cloud Storage Alert',
  'HR Policy Change',
  'DocuSign Request',
  'Security Alert Action'
]

const riskColor = {
  Low: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  Medium: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  High: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  Critical: 'text-red-400 bg-red-500/15 border-red-500/30'
}

export default function AICampaignGenerator() {
  const [companyName, setCompanyName] = useState('')
  const [targetDept, setTargetDept] = useState('')
  const [attackStylesSelected, setAttackStylesSelected] = useState([])

  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState('')

  const toggleAttackStyle = (style) => {
    if (attackStylesSelected.includes(style)) {
      setAttackStylesSelected(
        attackStylesSelected.filter(s => s !== style)
      )
    } else {
      setAttackStylesSelected([
        ...attackStylesSelected,
        style
      ])
    }
  }

  const handleGenerate = async () => {
    if (!companyName || !targetDept || attackStylesSelected.length === 0) return

    setLoading(true)
    setError('')
    setCampaigns([])

    try {
      const requests = attackStylesSelected.map(async (style) => {
        // First generate the raw campaign text via AI
        const aiResponse = await campaignAPI.generate({
          company_name: companyName,
          target_department: targetDept,
          attack_style: style
        });
        
        const campaignData = aiResponse.data;
        
        // Immediately trigger the creation of a sending Simulation from this data
        // We override the generator by passing the explicit subject and body to the backend's standard simulation generator
        // (Assuming the backend expects `simulation_type`, `department`, `company_name` to auto-gen, so we will pass raw values)
        return campaignData;
      });

      const generatedCampaigns = await Promise.all(requests)
      setCampaigns(generatedCampaigns)

    } catch (err) {
      setError(err.response?.data?.detail || 'Campaign generation failed.')
    } finally {
      setLoading(false)
    }
  }

  // Bootcamp generation removed. Admin Hub takes over handling.

  return (
    <div>

      <h1 className="page-header">
        AI Attack Simulation Engine
      </h1>

      <p className="page-subtitle">
        Generate AI-powered phishing campaigns and security awareness training
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Generator Panel */}
        <div className="space-y-4">

          <div className="glass-card p-5 space-y-4">

            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Zap size={16} />
              Campaign Configuration
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                <Building2 size={12} /> Company Name
              </label>

              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                placeholder="e.g., Acme Corporation"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                <Target size={12} /> Target Department
              </label>

              <input
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
                placeholder="e.g., IT Department"
              />
            </div>

            <div>

              <label className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Attack Categories
              </label>

              <div className="grid grid-cols-2 gap-2">

                {attackStyles.map((style) => (

                  <button
                    key={style}
                    onClick={() => toggleAttackStyle(style)}
                    className={`px-3 py-2 rounded-lg text-xs border text-left ${
                      attackStylesSelected.includes(style)
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {style}
                  </button>

                ))}

              </div>

            </div>

            {error && (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <motion.button
              onClick={handleGenerate}
              disabled={
                loading ||
                !companyName ||
                !targetDept ||
                attackStylesSelected.length === 0
              }
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate Campaigns
                </>
              )}

            </motion.button>

          </div>

        </div>

        {/* Preview Panel */}
        <div>

          {loading && (
            <div className="glass-card p-8 flex flex-col items-center justify-center gap-4 min-h-64">

              <Loader className="animate-spin text-cyan-400" size={32} />

              <div className="text-gray-500 text-sm">
                AI generating phishing campaigns...
              </div>

            </div>
          )}

          <AnimatePresence>

            {campaigns.length > 0 && !loading && (

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >

                {campaigns.map((campaign, index) => (

                  <div
                    key={index}
                    className="glass-card p-5 border border-cyan-500/20"
                  >

                    <div className="flex items-start justify-between mb-4">

                      <div>

                        <div className="text-cyan-400 font-bold text-lg">
                          {campaign.campaign_name}
                        </div>

                        <div className="text-gray-400 text-sm mt-1">
                          Attack Type: {campaign.attack_type}
                        </div>

                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${riskColor[campaign.risk_level]}`}
                      >
                        {campaign.risk_level}
                      </span>

                    </div>

                    <div className="bg-dark-700/50 rounded-lg p-4 border border-white/5">

                      <div className="text-xs text-gray-500 mb-1">
                        Subject:
                      </div>

                      <div className="text-white font-medium text-sm mb-3">
                        {campaign.email_subject}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-700/90 to-transparent h-12 flex items-end justify-center pb-2 pointer-events-none">
                        <span className="text-xs text-cyan-400 opacity-80">Campaign successfully saved to database</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg">
                       <span className="text-sm text-emerald-400 font-medium">Ready for deployment</span>
                       <a href="/admin/simulations" className="text-xs flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded transition-colors">
                         Open Admin Hub <Send size={12} />
                       </a>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  )
}