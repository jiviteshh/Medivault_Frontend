import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Shield, 
  Clock, 
  LogOut,
  Menu,
  X,
  Search,
  Users
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import { useState } from 'react'

interface SidebarProps {
  userRole: 'PATIENT' | 'DOCTOR'
}

const patientLinks = [
  { to: '/patient', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/patient/records', icon: FileText, label: 'My Records' },
  { to: '/patient/upload', icon: Upload, label: 'Upload Record' },
  { to: '/patient/requests', icon: Shield, label: 'Access Requests' },
  { to: '/patient/sessions', icon: Clock, label: 'Active Sessions' },
]

const doctorLinks = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/doctor/search', icon: Search, label: 'Search Patient' },
  { to: '/doctor/patients', icon: Users, label: 'My Patients' },
  { to: '/doctor/sessions', icon: Clock, label: 'Sessions' },
]

export default function Sidebar({ userRole }: SidebarProps) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const links = userRole === 'PATIENT' ? patientLinks : doctorLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/20">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-800">MediVault</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-teal-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              )
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole.toLowerCase()}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-3 rounded-xl glass text-slate-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 glass z-50 flex flex-col"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 glass fixed left-4 top-4 bottom-4 rounded-2xl flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
