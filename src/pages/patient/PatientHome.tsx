import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  Shield, 
  Clock, 
  ArrowRight,
  Activity,
  Heart,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import { patientAPI, accessAPI, sessionAPI } from '../../services/api'
import { formatDate } from '../../lib/utils'
import { CardSkeleton } from '../../components/ui/Skeleton'

interface Record {
  id: string
  title: string
  createdAt: string
}

interface Request {
  id: string
  doctorName: string
  status: string
  createdAt: string
}

interface Session {
  id: string
  doctorName: string
}

export default function PatientHome() {
  const { user, updateUser } = useAuth()
  const [records, setRecords] = useState<Record[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeRecord = (r: any): Record => ({
    id: String(r.id || ''),
    title: r.hospitalName || r.title || r.recordType || 'Medical Record',
    createdAt: r.visitDate || r.createdAt || new Date().toISOString(),
  })

  const normalizeRequest = (request: Partial<Request> & Record<string, unknown>): Request => ({
    id: String(request.id || request.requestId || request.doctorId || request.doctorName || ''),
    doctorName: String(request.doctorName || request.doctor_name || request.username || 'Doctor'),
    status: String(request.status || 'PENDING'),
    createdAt: String(request.createdAt || request.created_at || new Date().toISOString())
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, requestsRes, sessionsRes, profileRes] = await Promise.all([
          patientAPI.getRecords().catch(() => ({ data: [] })),
          accessAPI.getPatientRequests().catch(() => ({ data: [] })),
          sessionAPI.getActiveSessions().catch(() => ({ data: [] })),
          patientAPI.getProfile().catch(() => ({ data: null })),
        ])
        setRecords((recordsRes.data || []).map(normalizeRecord).slice(0, 3))
        setRequests(
          (requestsRes.data || [])
            .map(normalizeRequest)
            .filter((r: Request) => r.status === 'PENDING')
            .slice(0, 3)
        )
        setSessions(sessionsRes.data?.slice(0, 3) || [])
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
    { to: '/patient/upload', icon: Upload, label: 'Upload Record', color: 'primary' },
    { to: '/patient/records', icon: FileText, label: 'View Records', color: 'teal' },
    { to: '/patient/requests', icon: Shield, label: 'Access Requests', color: 'blue' },
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
        title={`Welcome back, ${user?.name || user?.username || 'Patient'}`} 
        subtitle="Here's an overview of your health records"
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
                <h2 className="text-2xl font-bold mb-2">Your Health, Your Control</h2>
                <p className="text-white/80 max-w-md">
                  Manage your medical records securely. Grant or revoke access to healthcare providers with ease.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                  <Activity className="w-5 h-5" />
                  <span className="font-medium">{records.length} Records</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Healthy</span>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-5 top-20 w-20 h-20 rounded-full bg-white/10" />
          </Card>
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

        {/* Grid for Records and Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Records */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Recent Records</h3>
              <Link to="/patient/records" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : records.length > 0 ? (
                records.map((record) => (
                  <Card key={record.id} hover className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{record.title}</p>
                      <p className="text-sm text-slate-500">{formatDate(record.createdAt)}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No records yet</p>
                  <Link to="/patient/upload" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                    Upload your first record
                  </Link>
                </Card>
              )}
            </div>
          </motion.div>

          {/* Pending Requests */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Pending Requests</h3>
              <Link to="/patient/requests" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <Card key={request.id} hover className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">Dr. {request.doctorName}</p>
                      <p className="text-sm text-slate-500">Pending approval</p>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No pending requests</p>
                </Card>
              )}
            </div>
          </motion.div>
        </div>

        {/* Active Sessions */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Active Sessions</h3>
            <Link to="/patient/sessions" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              Manage
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-primary-400 flex items-center justify-center text-white font-semibold">
                    {session.doctorName?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">Dr. {session.doctorName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No active timed sessions</p>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
