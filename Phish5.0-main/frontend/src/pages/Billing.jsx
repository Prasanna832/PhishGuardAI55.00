import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Zap, ShieldCheck, Download, AlertCircle } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'Perfect for small teams getting started with cybersecurity.',
    features: [
      'Up to 50 employees',
      'Basic Email Analysis',
      'Monthly Security Simulations',
      'Standard Support'
    ],
    recommended: false,
    buttonText: 'Current Plan',
    buttonClass: 'btn-secondary',
    current: true
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/mo',
    description: 'Advanced protection for growing organizations.',
    features: [
      'Up to 250 employees',
      'Advanced AI Email Analysis',
      'Weekly Targeted Simulations',
      'AI Campaign Generator',
      'Priority 24/7 Support'
    ],
    recommended: true,
    buttonText: 'Upgrade Now',
    buttonClass: 'btn-primary',
    current: false
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Comprehensive security suite for large enterprises.',
    features: [
      'Unlimited employees',
      'Real-time Threat Intelligence',
      'Custom Simulation Scenarios',
      'Dedicated Customer Success Manager',
      'API Access & Integrations'
    ],
    recommended: false,
    buttonText: 'Contact Sales',
    buttonClass: 'btn-secondary',
    current: false
  }
]

const billingHistory = [
  { id: 'INV-2024-001', date: 'Oct 01, 2024', amount: '$49.00', status: 'Paid', plan: 'Starter Plan' },
  { id: 'INV-2024-002', date: 'Sep 01, 2024', amount: '$49.00', status: 'Paid', plan: 'Starter Plan' },
  { id: 'INV-2024-003', date: 'Aug 01, 2024', amount: '$49.00', status: 'Paid', plan: 'Starter Plan' },
]

export default function Billing() {
  const [annualBilling, setAnnualBilling] = useState(true)
  const [activePlan, setActivePlan] = useState('Starter')
  const [toastMessage, setToastMessage] = useState(null)

  const handlePlanAction = (planName, actionText) => {
    if (actionText === 'Current Plan' || planName === 'Enterprise') return
    
    // Simulate updating plan
    setActivePlan(planName)
    setToastMessage(`Successfully upgraded to the ${planName} plan!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handlePaymentUpdate = () => {
    setToastMessage('Redirecting to secure payment portal...')
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="fixed top-20 right-6 z-50 bg-emerald-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-md border border-emerald-400/50"
        >
          <CheckCircle size={20} />
          <span className="font-medium">{toastMessage}</span>
        </motion.div>
      )}
      {/* Header */}
      <div>
        <h1 className="page-header flex items-center gap-3">
          <CreditCard className="text-cyan-400" size={28} />
          Billing & Plans
        </h1>
        <p className="page-subtitle">Manage your subscription, payment methods, and billing history.</p>
      </div>

      {/* Current Plan Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-white">{activePlan} Plan</h2>
            <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full border border-cyan-500/30">Active</span>
          </div>
          <p className="text-gray-400 mb-4 max-w-md">Your next billing date is <span className="text-white font-medium">Nov 01, 2024</span> for <span className="text-white font-medium">$49.00</span>.</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>42 / 50 Employees Active</span>
            </div>
          </div>
          
          <div className="mt-3 w-full bg-dark-700 rounded-full h-1.5 max-w-sm">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '84%' }} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
          <button onClick={handlePaymentUpdate} className="btn-secondary">Update Payment Method</button>
          <button onClick={() => handlePlanAction(plans.find(p => p.name !== activePlan && p.name !== 'Enterprise')?.name || 'Professional', 'Upgrade Now')} className="btn-primary flex items-center justify-center gap-2">
            <Zap size={16} /> Upgrade Plan
          </button>
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Available Plans</h2>
          
          <div className="flex items-center gap-3 bg-dark-800 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${annualBilling ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Annual <span className="text-xs ml-1 opacity-80">(Save 20%)</span>
            </button>
            <button 
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${!annualBilling ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass-card p-6 flex flex-col h-full ${
                plan.recommended 
                  ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  RECOMMENDED
                </div>
              )}
              
              <div className="mb-4 mt-2">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400 h-10">{plan.description}</p>
              </div>
              
              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price !== 'Custom' && annualBilling ? `$${Math.floor(parseInt(plan.price.replace('$','')) * 0.8 * 12)}` : plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-400 mb-1">{annualBilling ? '/yr' : plan.period}</span>
                  )}
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handlePlanAction(plan.name, activePlan === plan.name ? 'Current Plan' : plan.buttonText)}
                className={`w-full ${activePlan === plan.name ? 'btn-secondary opacity-50 cursor-default' : plan.buttonClass} py-2.5 font-medium`}
              >
                {activePlan === plan.name ? 'Current Plan' : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Billing History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">Invoice</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {billingHistory.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{invoice.id}</td>
                  <td className="px-6 py-4 text-gray-400">{invoice.date}</td>
                  <td className="px-6 py-4 text-gray-300">{invoice.plan}</td>
                  <td className="px-6 py-4 text-white font-medium">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      <CheckCircle size={12} /> {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-cyan-400 transition-colors inline-block p-1">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* FAQ or Help info */}
      <div className="flex items-start gap-3 p-4 bg-dark-800 rounded-xl border border-white/5 text-sm">
        <AlertCircle className="text-cyan-500 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-white font-medium mb-1">Need help with billing?</p>
          <p className="text-gray-400 text-xs">For questions about your subscription, changing your payment method, or obtaining previous invoices, please contact our support team at <a href="#" className="text-cyan-400 hover:underline">billing@phishguard.ai</a>.</p>
        </div>
      </div>
    </div>
  )
}
