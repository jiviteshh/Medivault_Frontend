import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  XCircle,
  User,
  Building,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { sessionAPI } from '../../services/api'
import { formatDateTime } from '../../lib/utils'
import { toast } from 'sonner'

interface Session {
  id: string
  sessionId?: string | number
  doctorId: string
  doctorName: string
  hospital?: string
  specialization?: string
  startedAt: string
  expiresAt?: string
}

export default function PatientSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [endModal, setEndModal] = useState<{ open: boolean; session: Session | null }>({
    open: false,
    session: null,
  })
  const [isEnding, setIsEnding] = useState(false)

  const normalizeSession = (session: Partial<Session> & Record<string, unknown>): Session => ({
    id: String(session.id || session.sessionId || session.doctorId || ''),
    sessionId: session.sessionId as string | number | undefined,
    doctorId: String(session.doctorId || session.doctor_id || session.id || ''),
    doctorName: String(session.doctorName || session.doctor_name || session.username || 'Doctor'),
    hospital: session.hospital as string | undefined,
    specialization: (session.specialization || session.specialty) as string | undefined,
    startedAt: String(session.startedAt || session.started_at || new Date().toISOString()),
    expiresAt: (session.expiresAt || session.expiryTime || session.expires_at) as string | undefined
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getActiveSessions()
      console.log('=== PATIENT SESSIONS ===')
      console.log(JSON.stringify(response.data, null, 2))
      setSessions((response.data || []).map(normalizeSession))
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!endModal.session) return
    
    setIsEnding(true)
    try {
      await sessionAPI.endSession(endModal.session.id)
      setSessions(sessions.filter(s => s.id !== endModal.session!.id))
      toast.success('Session ended successfully')
      setEndModal({ open: false, session: null })
    } catch (error) {
      toast.error('Failed to end session')
    } finally {
      setIsEnding(false)
    }
  }

  return (
    <div>
      <Navbar 
        title="Active Sessions" 
        subtitle={`${sessions.length} active ${sessions.length === 1 ? 'session' : 'sessions'}`}
      />

      {/* Info Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-200/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">About Active Sessions</h3>
            <p className="text-sm text-slate-600">
              Doctors can view your medical records only during an active timed session. Sessions are automatically started when you approve an access request. You can revoke access at any time by ending the session.
            </p>
          </div>
        </div>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : sessions.length > 0 ? (
          <AnimatePresence>
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Doctor Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-primary-400 flex items-center justify-center text-white font-semibold text-lg">
                          {session.doctorName?.charAt(0) || 'D'}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-800">Dr. {session.doctorName}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          {session.specialization && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {session.specialization}
                            </span>
                          )}
                          {session.hospital && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {session.hospital}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Started {formatDateTime(session.startedAt)}
                          </span>
                          {session.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Expires {formatDateTime(session.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* End Session Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEndModal({ open: true, session })}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors shrink-0"
                    >
                      <XCircle className="w-4 h-4" />
                      End Session
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No active sessions</h3>
            <p className="text-slate-500">
              When you approve a doctor's access request, an active session will appear here
            </p>
          </Card>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={endModal.open}
        onClose={() => setEndModal({ open: false, session: null })}
        title="End Session"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to end the session with <strong>Dr. {endModal.session?.doctorName}</strong>? 
          They will no longer be able to view your medical records.
        </p>
        <div className="flex gap-3 justify-end">
          <Button 
            variant="secondary" 
            onClick={() => setEndModal({ open: false, session: null })}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleEndSession}
            isLoading={isEnding}
          >
            End Session
          </Button>
        </div>
      </Modal>
    </div>
  )
}
