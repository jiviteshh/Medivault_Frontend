import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Users, 
  Clock, 
  FileText,
  ArrowRight,
  Stethoscope,
  TrendingUp,
  Activity
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import { doctorAPI } from '../../services/api'
import { CardSkeleton } from '../../components/ui/Skeleton'

interface Session {
  id: string
  patientId: string
  patientName: string
}

export default function DoctorHome() {
  const { user, updateUser } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const normalizeSession = (session: Partial<Session> & Record<string, unknown>): Session => ({
    id: String(session.id || session.sessionId || session.patientId || ''),
    patientId: String(session.patientId || session.patient_id || session.id || ''),
    patientName: String(session.patientName || session.patient_name || session.username || 'Patient')
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, profileRes] = await Promise.all([
          doctorAPI.getActivePatients().catch(() => ({ data: [] })),
          doctorAPI.getProfile().catch(() => ({ data: null })),
        ])
        setSessions((sessionsRes.data || []).map(normalizeSession))
        // Persist full name — try multiple field names from the profile DTO
        const fullName = profileRes.data?.fullName || profileRes.data?.full_name || profileRes.data?.name
        if (fullName && user) {
          updateUser({ ...user, name: fullName })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const quickActions = [
    { to: '/doctor/search', icon: Search, label: 'Search Patient', color: 'primary' },
    { to: '/doctor/patients', icon: Users, label: 'My Patients', color: 'teal' },
    { to: '/doctor/sessions', icon: Clock, label: 'Sessions', color: 'blue' },
  ]

  const stats = [
    { label: 'Active Sessions', value: sessions.length, icon: Activity, color: 'primary' },
    { label: 'Patients Today', value: sessions.length, icon: Users, color: 'teal' },
    { label: 'Records Viewed', value: 0, icon: FileText, color: 'blue' },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div>
      <Navbar 
        title={`Welcome, Dr. ${user?.name || user?.username || 'Doctor'}`} 
        subtitle="Here's your practice overview"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Welcome Banner */}
        <motion.div variants={item}>
          <Card gradient className="relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Healthcare Provider Dashboard</h2>
                <p className="text-white/80 max-w-md">
                  Request access, then start time-bound sessions to view patient records securely.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                  <Stethoscope className="w-5 h-5" />
                  <span className="font-medium">Provider</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-5 top-20 w-20 h-20 rounded-full bg-white/10" />
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="card-glass flex items-center gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${action.color}-100 flex items-center justify-center`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{action.label}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Active Patient Sessions</h3>
            <Link to="/doctor/sessions" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.slice(0, 6).map((session) => (
                <Card key={session.id} hover className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-semibold">
                      {session.patientName?.charAt(0) || 'P'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{session.patientName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-green-600">Active session</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 mb-3">No active timed sessions</p>
              <Link to="/doctor/search" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                Search for a patient to request access or start a timed session
              </Link>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
