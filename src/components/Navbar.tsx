import { motion } from 'framer-motion'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface NavbarProps {
  title: string
  subtitle?: string
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl lg:text-3xl font-bold text-slate-800"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-1"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/60 text-slate-500 hover:bg-white/80 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search...</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/60 text-slate-600 hover:bg-white/80 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </motion.button>

        {/* User Avatar */}
        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">
              {user?.name || user?.username || 'User'}
            </p>
            <p className="text-xs text-slate-400">
              ID: {user?.id} · <span className="capitalize">{user?.role?.toLowerCase()}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-semibold shrink-0">
            {(user?.name || user?.username)?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
