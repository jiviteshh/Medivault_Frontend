import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  XCircle,
  Calendar,
  User,
  FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { doctorAPI, sessionAPI } from '../../services/api'
import { formatDateTime } from '../../lib/utils'
import { toast } from 'sonner'

interface Session {
  id: string
  patientId: string
  patientName: string
  startedAt: string
}

export default function DoctorSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [endModal, setEndModal] = useState<{ open: boolean; session: Session | null }>({
    open: false,
    session: null,
  })
  const [isEnding, setIsEnding] = useState(false)

  const normalizeSession = (session: Partial<Session> & Record<string, unknown>): Session => ({
    id: String(session.id || session.sessionId || session.patientId || ''),
    patientId: String(session.patientId || session.patient_id || session.id || ''),
    patientName: String(session.patientName || session.patient_name || session.username || 'Patient'),
    startedAt: String(session.startedAt || session.started_at || new Date().toISOString())
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await doctorAPI.getActivePatients()
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
        title="Session Management" 
        subtitle={`${sessions.length} active ${sessions.length === 1 ? 'session' : 'sessions'}`}
      />

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <CardSkeleton />
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
                    {/* Patient Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-semibold text-lg">
                          {session.patientName?.charAt(0) || 'P'}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-800">{session.patientName}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            ID: {session.patientId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Started {formatDateTime(session.startedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to="/doctor/patients">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-600 font-medium hover:bg-primary-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View Records
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEndModal({ open: true, session })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        End
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No active timed sessions</h3>
            <p className="text-slate-500 mb-4">
              Start a timed session after the patient has approved your access request
            </p>
            <Link to="/doctor/search">
              <Button>Search Patient</Button>
            </Link>
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
          Are you sure you want to end your session with <strong>{endModal.session?.patientName}</strong>? 
          You will no longer have access to their medical records.
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
