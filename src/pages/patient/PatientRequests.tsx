import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Check,
  X,
  Clock,
  User,
  Building
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { accessAPI, sessionAPI } from '../../services/api'
import { formatDateTime } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface AccessRequest {
  id: string
  requestId?: string | number
  doctorId: string
  doctorName: string
  hospital?: string
  specialization?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export default function PatientRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [activeSessionCount, setActiveSessionCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  
  // Duration selection modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<AccessRequest | null>(null)
  const [selectedDuration, setSelectedDuration] = useState('30')
  const [customDuration, setCustomDuration] = useState('')
  const [isApprovingWithDuration, setIsApprovingWithDuration] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    fetchActiveSessions()
  }, [])

  const normalizeRequest = (request: Partial<AccessRequest> & Record<string, unknown>): AccessRequest => ({
    id: String(request.id || request.requestId || request.doctorId || request.doctorName || ''),
    requestId: request.requestId as string | number | undefined,
    doctorId: String(request.doctorId || request.id || request.requestId || ''),
    doctorName: String(request.doctorName || request.doctor_name || request.username || 'Doctor'),
    hospital: request.hospital as string | undefined,
    specialization: request.specialization as string | undefined,
    status: ((request.status as string) || 'PENDING') as AccessRequest['status'],
    createdAt: String(request.createdAt || request.created_at || new Date().toISOString())
  })

  const fetchRequests = async () => {
    try {
      const response = await accessAPI.getPatientRequests()
      console.log('=== PATIENT ACCESS REQUESTS ===')
      console.log(JSON.stringify(response.data, null, 2))
      setRequests((response.data || []).map(normalizeRequest))
    } catch (error: any) {
      console.log('=== PATIENT ACCESS REQUESTS ERROR ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)
      toast.error('Failed to load timed access requests')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActiveSessions = async () => {
    try {
      const response = await sessionAPI.getActiveSessions()
      console.log('=== PATIENT ACTIVE SESSIONS ===')
      console.log(JSON.stringify(response.data, null, 2))
      setActiveSessionCount((response.data || []).length)
    } catch (error: any) {
      console.log('=== PATIENT ACTIVE SESSIONS ERROR ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)
    }
  }

  const handleUpdateStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'APPROVED') {
      // Open modal for duration selection
      const request = requests.find(r => r.id === requestId)
      if (request) {
        setSelectedRequestForApproval(request)
        setIsApprovalModalOpen(true)
      }
    } else {
      // Directly reject without modal
      setProcessingId(requestId)
      try {
        await accessAPI.updateRequestStatus(requestId, 'REJECTED')
        await fetchActiveSessions()
        setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r)))
        toast.success('Timed access request rejected')
      } catch (error) {
        toast.error('Failed to update timed access request')
      } finally {
        setProcessingId(null)
      }
    }
  }

  const handleApproveWithDuration = async () => {
    if (!selectedRequestForApproval) return

    const validMinutes =
      selectedDuration === 'custom'
        ? Number(customDuration || 30)
        : Number(selectedDuration || 30)

    if (!Number.isFinite(validMinutes) || validMinutes <= 0) {
      toast.error('Please enter a valid duration')
      return
    }

    setIsApprovingWithDuration(true)
    try {
      // Approve the request with duration - backend will auto-generate access key
      console.log('=== APPROVE ACCESS REQUEST WITH DURATION ===')
      console.log(JSON.stringify({ 
        requestId: selectedRequestForApproval.id,
        validMinutes 
      }, null, 2))
      
      await accessAPI.approveWithDuration(selectedRequestForApproval.id, validMinutes)
      console.log('Request approved and access key generated')

      // Update local state
      await fetchActiveSessions()
      setRequests(requests.map((r) => 
        r.id === selectedRequestForApproval.id ? { ...r, status: 'APPROVED' } : r
      ))

      // Show success message
      toast.success(
        `Access approved for ${validMinutes} minutes. Doctor can now view your records immediately!`
      )
      setIsApprovalModalOpen(false)
      setSelectedRequestForApproval(null)
      setSelectedDuration('30')
      setCustomDuration('')
    } catch (error: any) {
      console.log('=== APPROVAL ERROR ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to approve request'

      toast.error(errorMessage)
    } finally {
      setIsApprovingWithDuration(false)
    }
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter)

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    }

    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {status}
      </span>
    )
  }

  return (
    <div>
      <Navbar
        title="Timed Access Requests"
        subtitle={`${pendingCount} pending ${pendingCount === 1 ? 'request' : 'requests'} | ${activeSessionCount} active ${activeSessionCount === 1 ? 'session' : 'sessions'}`}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === tab
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80'
              )}
            >
              {tab === 'all' ? 'All Requests' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </motion.button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filteredRequests.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-primary-400 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                        {request.doctorName?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-800">Dr. {request.doctorName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          {request.specialization && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {request.specialization}
                            </span>
                          )}
                          {request.hospital && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {request.hospital}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateStatus(request.id, 'APPROVED')}
                          disabled={processingId === request.id || isApprovingWithDuration}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                          disabled={processingId === request.id || isApprovingWithDuration}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No requests found</h3>
            <p className="text-slate-500">
              {filter !== 'all'
                ? `No ${filter.toLowerCase()} requests`
                : 'When doctors request timed access to your records, they will appear here'}
            </p>
          </Card>
        )}
      </div>

      {/* Duration Selection Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false)
          setSelectedRequestForApproval(null)
          setSelectedDuration('30')
          setCustomDuration('')
        }}
        title={`Approve Access Request - ${selectedRequestForApproval?.doctorName || 'Doctor'}`}
      >
        <div className="space-y-4">
          <p className="text-slate-700 text-sm">
            Select how long you want to grant access to your medical records.
          </p>

          <div className="space-y-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-800">Access Duration</span>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="input-glass w-full"
                disabled={isApprovingWithDuration}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="custom">Custom</option>
              </select>
            </label>

            {selectedDuration === 'custom' && (
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">Custom Duration (minutes)</span>
                <input
                  type="number"
                  min="1"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="input-glass w-full"
                  placeholder="45"
                  disabled={isApprovingWithDuration}
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setIsApprovalModalOpen(false)
                setSelectedRequestForApproval(null)
                setSelectedDuration('30')
                setCustomDuration('')
              }}
              variant="secondary"
              className="flex-1"
              disabled={isApprovingWithDuration}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveWithDuration}
              isLoading={isApprovingWithDuration}
              className="flex-1"
            >
              <Check className="w-4 h-4" />
              Approve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
