import { motion } from 'framer-motion'
import { 
  Search, 
  Users, 
  Clock, 
  FileText,
  Shield,
  Lock,
  Stethoscope,
  Activity,
  LogOut,
  Mail
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface LockedCardProps {
  icon: React.ElementType
  title: string
  description: string
  delay?: number
}

function LockedCard({ icon: Icon, title, description, delay = 0 }: LockedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01 }}
      className="relative group cursor-not-allowed"
    >
      {/* Blurred Card Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 blur-[1px] opacity-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
      </div>
      
      {/* Lock Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[0.5px] rounded-2xl border border-slate-200/30 transition-all group-hover:bg-white/30">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 text-white text-sm shadow-lg">
          <Lock className="w-4 h-4" />
          <span>Available after approval</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function LockedDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isRejected = user?.status === 'REJECTED'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const lockedSections = [
    { 
      icon: Search, 
      title: 'Search Patients', 
      description: 'Find patients by ID and request access to their records'
    },
    { 
      icon: Users, 
      title: 'My Patients', 
      description: 'View all patients who have granted you access'
    },
    { 
      icon: FileText, 
      title: 'Access Requests', 
      description: 'Manage pending and approved access requests'
    },
    { 
      icon: Activity, 
      title: 'Active Sessions', 
      description: 'Monitor your current active patient sessions'
    },
  ]

  const stats = [
    { label: 'Patients', value: '-', icon: Users },
    { label: 'Sessions', value: '-', icon: Clock },
    { label: 'Records', value: '-', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50">
      {/* Fixed Sidebar Preview - Locked */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 z-40">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">MediVault</span>
          </div>
        </div>

        {/* Sidebar Nav - All Locked */}
        <nav className="p-4 space-y-2">
          {[
            { icon: Stethoscope, label: 'Dashboard' },
            { icon: Search, label: 'Search Patients' },
            { icon: Users, label: 'My Patients' },
            { icon: Clock, label: 'Sessions' },
          ].map((item, index) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/50 text-slate-400 cursor-not-allowed opacity-60"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              <Lock className="w-4 h-4 ml-auto" />
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">MediVault</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-80 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Pending Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 mb-8 ${
            isRejected
              ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isRejected ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <Clock className={`w-6 h-6 ${isRejected ? 'text-red-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">
                  {isRejected ? 'Account Rejected' : 'Account Pending Approval'}
                </h2>
                <p className="text-slate-600">
                  {isRejected
                    ? 'Your doctor account was rejected by the admin team. Please contact support for help.'
                    : 'Your credentials are being verified. This typically takes 24-48 hours.'}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isRejected
                ? 'bg-red-100 border border-red-200'
                : 'bg-amber-100 border border-amber-200'
            }`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isRejected ? 'bg-red-500' : 'bg-amber-500'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isRejected ? 'bg-red-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className={`font-medium text-sm ${isRejected ? 'text-red-700' : 'text-amber-700'}`}>
                {isRejected ? 'Rejected' : 'Pending'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Welcome, Dr. {user?.username || 'Doctor'}
          </h1>
          <p className="text-slate-500">
            {isRejected
              ? 'Your account is locked because the doctor application was rejected'
              : 'Your dashboard preview - full access will be enabled after approval'}
          </p>
        </motion.div>

        {/* Locked Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50 p-5 opacity-60"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-400">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Lock className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Locked Feature Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-400" />
            Dashboard Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedSections.map((section, index) => (
              <LockedCard
                key={section.title}
                icon={section.icon}
                title={section.title}
                description={section.description}
                delay={0.2 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 text-center"
        >
          <p className="text-slate-500 mb-4">Need assistance or have questions about the approval process?</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-shadow"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
