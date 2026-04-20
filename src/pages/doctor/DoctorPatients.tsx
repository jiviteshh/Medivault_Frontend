import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search,
  FileText,
  Eye,
  Download,
  Loader2
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { doctorAPI, recordsAPI } from '../../services/api'
import { formatDate } from '../../lib/utils'
import { toast } from 'sonner'

interface Session {
  id: string
  sessionId?: string | number
  patientId: string
  patientName: string
  startedAt: string
}

interface PatientRecord {
  id: string
  title: string
  description?: string
  createdAt: string
  testReports?: string | null
}

export default function DoctorPatients() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Session | null>(null)
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const normalizeSession = (session: Partial<Session> & Record<string, unknown>): Session => ({
    id: String(session.id || session.sessionId || ''),
    sessionId: session.sessionId as string | number | undefined,
    // patientId from SessionResponse is the profile ID, store it separately
    patientId: String(session.patientId || session.patient_id || ''),
    patientName: String(session.patientName || session.patient_name || session.username || 'Patient'),
    startedAt: String(session.startedAt || session.started_at || new Date().toISOString())
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoadError(null)
    try {
      const response = await doctorAPI.getActivePatients()
      console.log('=== DOCTOR ACTIVE PATIENTS ===')
      console.log(JSON.stringify(response.data, null, 2))
      setSessions((response.data || []).map(normalizeSession))
    } catch (error: any) {
      console.log('=== DOCTOR ACTIVE PATIENTS ERROR ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)
      
      setSessions([])
      
      if (error.response?.status === 403) {
        setLoadError('Search for patients and request access through the search feature. Once a patient approves your request and you generate an access key, your active sessions will appear here.')
      } else if (error.response?.status !== 403) {
        setLoadError('Failed to load active sessions')
        toast.error('Failed to load patients')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRecords = async (session: Session) => {
    setSelectedPatient(session)
    setIsLoadingRecords(true)
    setPatientRecords([])

    try {
      // Backend GET /doctor/records/{patientId} takes the patient profile ID
      const response = await doctorAPI.getPatientRecords(session.patientId)
      // Normalize raw records same way as PatientRecords.tsx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = (response.data || []).map((r: any): PatientRecord => ({
        id: String(r.id || ''),
        title: r.hospitalName || r.title || r.recordType || 'Medical Record',
        description: r.doctorSummary || r.symptoms || r.description || undefined,
        createdAt: r.visitDate || r.createdAt || new Date().toISOString(),
        testReports: r.testReports || null,
      }))
      setPatientRecords(normalized)
    } catch (error) {
      toast.error('Failed to load patient records')
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const handleView = async (record: PatientRecord) => {
    if (!record.testReports) {
      toast.info('No file attached to this record')
      return
    }
    try {
      const response = await recordsAPI.downloadRecord(record.id)
      const url = typeof response.data === 'string' ? response.data : response.data?.url
      if (url) {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
      } else {
        toast.info('No file available')
      }
    } catch {
      toast.error('Failed to open record')
    }
  }

  const handleDownload = async (record: PatientRecord) => {
    if (!record.testReports) {
      toast.info('No file attached to this record')
      return
    }
    try {
      const response = await recordsAPI.downloadRecord(record.id)
      // Backend returns plain string URL, not { url: string }
      const url = typeof response.data === 'string' ? response.data : response.data?.url
      if (url) {
        const a = document.createElement('a')
        a.href = url
        a.download = record.title
        a.click()
        toast.success('Download started')
      } else {
        toast.info('No file available')
      }
    } catch {
      toast.error('Failed to download record')
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Navbar 
        title="My Patients" 
        subtitle={`${sessions.length} patients with active access`}
      />

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-glass pl-12 w-full"
          />
        </div>
      </Card>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-semibold text-lg">
                        {session.patientName?.charAt(0) || 'P'}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{session.patientName}</h3>
                      <p className="text-sm text-slate-500">ID: {session.patientId}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-4">
                    <span>Access since: {formatDate(session.startedAt)}</span>
                  </div>

                  <div className="mt-auto">
                    <Button
                      variant="secondary"
                      onClick={() => handleViewRecords(session)}
                      icon={<FileText className="w-4 h-4" />}
                      className="w-full"
                    >
                      View Records
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {loadError ? 'No Active Sessions' : 'No patients found'}
          </h3>
          <p className="text-slate-500">
            {loadError 
              ? loadError
              : searchTerm 
                ? 'Try adjusting your search' 
                : 'Request access to patient records to see them here'}
          </p>
        </Card>
      )}

      {/* Patient Records Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => {
          setSelectedPatient(null)
          setPatientRecords([])
        }}
        title={`Patient Records`}
      >
        {/* Patient Header */}
        {selectedPatient && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-100 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
              {selectedPatient.patientName?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-lg truncate">{selectedPatient.patientName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-600 font-medium">Active Session</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-500">{patientRecords.length} record{patientRecords.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}

        {isLoadingRecords ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
            <p className="text-sm text-slate-500">Loading records...</p>
          </div>
        ) : patientRecords.length > 0 ? (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {patientRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-200"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{record.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{formatDate(record.createdAt)}</span>
                    {record.testReports && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-600 border border-teal-100">
                        File attached
                      </span>
                    )}
                  </div>
                  {record.description && (
                    <p className="text-xs text-slate-500 truncate mt-1">{record.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleView(record)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 text-xs font-medium transition-colors border border-primary-100"
                    title="View file"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownload(record)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 text-xs font-medium transition-colors border border-teal-100"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-600">No records available</p>
            <p className="text-sm text-slate-400 text-center max-w-xs">This patient hasn't uploaded any medical records yet.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
