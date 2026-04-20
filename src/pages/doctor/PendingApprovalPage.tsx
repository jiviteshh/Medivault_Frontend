import { motion } from 'framer-motion'
import { Clock, Shield, LogOut, Mail, CheckCircle, FileText, Users, Activity } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function PendingApprovalPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const lockedFeatures = [
    { icon: Users, label: 'Patient Records', description: 'View and manage patient health records' },
    { icon: FileText, label: 'Access Requests', description: 'Request access to patient data' },
    { icon: Activity, label: 'Sessions', description: 'Monitor active patient sessions' },
    { icon: Shield, label: 'Profile', description: 'Manage your professional profile' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-sky-200/40 to-teal-200/40 blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 20, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-teal-200/40 to-sky-200/40 blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">MediVault</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-red-500 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Status Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-6 shadow-lg shadow-amber-100/50"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-12 h-12 text-amber-500" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Your Account is Under Review
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-6">
              We are verifying your credentials. This process typically takes 24-48 hours.
            </p>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200 shadow-sm"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="font-semibold text-amber-700">Pending Approval</span>
            </motion.div>
          </motion.div>

          {/* Doctor Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'D'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Dr. {user?.username || 'Doctor'}</h3>
                <p className="text-slate-500">Healthcare Provider</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Account Created</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Verification In Progress</span>
              </div>
            </div>
          </motion.div>

          {/* Locked Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              Features Available After Approval
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lockedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50 p-5 opacity-60 blur-[0.5px]">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-700">{feature.label}</h3>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px] rounded-xl border border-slate-200/30">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 text-white text-sm">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Available after approval</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 text-center"
          >
            <p className="text-slate-500 mb-3">Need help or have questions?</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-shadow"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
