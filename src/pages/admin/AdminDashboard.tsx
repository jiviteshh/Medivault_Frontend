import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  LogOut, 
  Mail,
  RefreshCw,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { toast } from 'sonner'

interface PendingDoctor {
  id?: string | number
  userId?: string | number
  username: string
  email: string
  icmrId?: string
  status: string
  createdAt?: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const getDoctorId = (doctor: PendingDoctor) =>
    String(doctor.id || doctor.userId || doctor.email || doctor.username || '')

  const isPendingDoctor = (doctor: PendingDoctor) =>
    (doctor.status || '').toUpperCase() === 'PENDING'

  const fetchPendingDoctors = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getPendingDoctors()
      console.log('=== PENDING DOCTORS ===')
      console.log(JSON.stringify(response.data, null, 2))
      setPendingDoctors((response.data || []).filter(isPendingDoctor))
    } catch (error) {
      toast.error('Failed to fetch pending doctors')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingDoctors()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleApprove = async (doctorId: string) => {
    setProcessingId(doctorId)
    try {
      await adminAPI.approveDoctor(doctorId)
      toast.success('Doctor approved successfully')
      setPendingDoctors(prev => prev.filter(d => getDoctorId(d) !== doctorId))
    } catch (error) {
      toast.error('Failed to approve doctor')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (doctorId: string) => {
    setProcessingId(doctorId)
    try {
      await adminAPI.rejectDoctor(doctorId)
      toast.success('Doctor rejected')
      setPendingDoctors(prev => prev.filter(d => getDoctorId(d) !== doctorId))
    } catch (error) {
      toast.error('Failed to reject doctor')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">MediVault Admin</h1>
                <p className="text-sm text-slate-500">Manage doctor approvals</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-slate-700">{user?.username}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pendingDoctors.length}</p>
                <p className="text-sm text-slate-500">Pending Approvals</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">--</p>
                <p className="text-sm text-slate-500">Approved Today</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">--</p>
                <p className="text-sm text-slate-500">Total Doctors</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pending Doctors Section */}
        <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Pending Doctor Approvals</h2>
              <p className="text-sm text-slate-500">Review and approve new doctor registrations</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchPendingDoctors}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </motion.button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading pending doctors...</p>
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">All caught up!</h3>
              <p className="text-slate-500">No pending doctor approvals at the moment.</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {pendingDoctors.map((doctor, index) => (
                  (() => {
                    const doctorId = getDoctorId(doctor)
                    const doctorKey = doctorId || `${doctor.email}-${index}`

                    return (
                  <motion.div
                    key={doctorKey}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Doctor Avatar & Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-lg font-bold">
                        {doctor.username?.charAt(0).toUpperCase() || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">
                          Dr. {doctor.username}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{doctor.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* ICMR ID */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 border border-sky-100 mb-3">
                      <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-sky-500 font-medium">ICMR Registration ID</p>
                        <p className="text-sm font-bold text-sky-700 truncate">
                          {doctor.icmrId || <span className="text-slate-400 font-normal">Not provided</span>}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending Review
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApprove(doctorId)}
                        disabled={processingId === doctorId || !doctorId}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
                      >
                        {processingId === doctorId ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReject(doctorId)}
                        disabled={processingId === doctorId || !doctorId}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {processingId === doctorId ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject
                      </motion.button>
                    </div>
                  </motion.div>
                    )
                  })()
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
