import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  User,
  FileText,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { accessAPI, sessionAPI, doctorAPI, recordsAPI } from '../../services/api'
import { formatDate } from '../../lib/utils'
import { toast } from 'sonner'

interface SearchResult {
  patientId: string
  hasAccess: boolean
  sessionActive: boolean
}

interface PatientRecord {
  id: string
  title: string
  createdAt: string
  testReports?: string | null
}

export default function DoctorSearch() {
  const [patientId, setPatientId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!patientId.trim()) {
      toast.error('Please enter a patient ID')
      return
    }

    setIsSearching(true)
    setSearchResult(null)
    setRequestSent(false)
    setPatientRecords([])

    try {
      // Validate session with patient
      const sessionRes = await sessionAPI.validateSession(patientId).catch(() => ({ data: { valid: false } }))
      console.log('=== DOCTOR SESSION VALIDATION ===')
      console.log(JSON.stringify(sessionRes.data, null, 2))
      const hasSession = sessionRes.data?.valid || false

      setSearchResult({
        patientId,
        hasAccess: hasSession,
        sessionActive: hasSession,
      })

      // If has access, load records
      if (hasSession) {
        loadPatientRecords(patientId)
      }

      toast.success('Patient found')
    } catch (error) {
      toast.error('Patient not found')
      setSearchResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRequestAccess = async () => {
    if (!searchResult) return

    setIsRequesting(true)
    try {
      await accessAPI.requestAccess(searchResult.patientId)
      setRequestSent(true)
      toast.success('Timed access request sent successfully')
    } catch (error: any) {
      console.log('=== DOCTOR ACCESS REQUEST ERROR ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)

      const errorMessage = String(error.response?.data?.message || '')
      const errorDetails = String(error.response?.data?.details || '')
      
      if (errorMessage.toLowerCase().includes('doctor profile not found')) {
        toast.error('Doctor profile not found. Complete the doctor profile setup before requesting access.')
      } else if (errorMessage.toLowerCase().includes('patient profile not found')) {
        toast.error('Patient profile not found. The patient must complete profile setup before access can be requested.')
      } else if (
        errorMessage.toLowerCase().includes('duplicate') || 
        errorDetails.toLowerCase().includes('duplicate') ||
        errorMessage.toLowerCase().includes('already')
      ) {
        setRequestSent(true)
        toast.error('You already have a pending access request for this patient. Waiting for their response.')
      } else {
        toast.error(errorMessage || 'Failed to send request')
      }
    } finally {
      setIsRequesting(false)
    }
  }

  const loadPatientRecords = async (id: string) => {
    setIsLoadingRecords(true)
    try {
      const response = await doctorAPI.getPatientRecords(id)
      // Normalize backend fields to frontend-friendly names
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = (response.data || []).map((r: any): PatientRecord => ({
        id: String(r.id || ''),
        title: r.hospitalName || r.title || r.recordType || 'Medical Record',
        createdAt: r.visitDate || r.createdAt || new Date().toISOString(),
        testReports: r.testReports || null,
      }))
      setPatientRecords(normalized)
    } catch (error) {
      console.error('Error loading records:', error)
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const handleViewRecord = async (record: PatientRecord) => {
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

  return (
    <div>
      <Navbar 
        title="Search Patient" 
        subtitle="Find a patient and request timed access to their records"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Search Form */}
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Patient ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                  className="input-glass pl-12 pr-32"
                  disabled={isSearching}
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Search Result */}
        <AnimatePresence mode="wait">
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white font-bold text-xl">
                    {searchResult.patientId.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800">Patient Found</h3>
                    <p className="text-slate-500">ID: {searchResult.patientId}</p>
                  </div>
                  {searchResult.hasAccess ? (
                    <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Timed Session Active
                    </span>
                  ) : requestSent ? (
                    <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Timed Request Pending
                    </span>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                      No Timed Session
                    </span>
                  )}
                </div>

                {/* Access Status */}
                {searchResult.hasAccess ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-green-700">
                        You have an active timed session with this patient. You can view their medical records below.
                      </p>
                    </div>

                    {/* Patient Records */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Medical Records</h4>
                      {isLoadingRecords ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                      ) : patientRecords.length > 0 ? (
                        patientRecords.map((record) => (
                          <motion.div
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">{record.title}</p>
                              <p className="text-sm text-slate-500">{formatDate(record.createdAt)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleViewRecord(record)}
                            >
                              View
                            </Button>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-center py-8 text-slate-500">No records available</p>
                      )}
                    </div>
                  </div>
                ) : requestSent ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-800">Timed Request Sent</p>
                        <p className="text-sm text-amber-600">
                          Waiting for the patient to approve your timed access request. Once approved, you will be able to view their records.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-slate-600">
                        You do not have a timed session for this patient. Request timed access and wait for the patient to approve your request.
                      </p>
                    </div>
                    <Button
                      onClick={handleRequestAccess}
                      isLoading={isRequesting}
                      icon={<Send className="w-4 h-4" />}
                      className="w-full"
                    >
                      Request Timed Access
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {!searchResult && (
          <Card className="bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-200/50">
            <div className="text-center py-4">
              <Search className="w-12 h-12 mx-auto text-primary-400 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Find Your Patient</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Enter the patient&apos;s ID to search. Once found, you can request timed access to view their medical records.
              </p>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
