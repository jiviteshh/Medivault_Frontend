import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  Calendar
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { RecordSkeleton } from '../../components/ui/Skeleton'
import { patientAPI, recordsAPI } from '../../services/api'
import { formatDate } from '../../lib/utils'
import { toast } from 'sonner'

interface Record {
  id: string
  title: string
  description?: string
  fileName?: string
  fileType?: string
  createdAt: string
}

// Backend returns hospitalName/visitDate/doctorSummary — normalize to what UI expects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeRecord = (r: any): Record => ({
  id: String(r.id || ''),
  title: r.hospitalName || r.title || r.recordType || 'Medical Record',
  description: r.doctorSummary || r.symptoms || r.description || undefined,
  createdAt: r.visitDate || r.createdAt || new Date().toISOString(),
})

export default function PatientRecords() {
  const [records, setRecords] = useState<Record[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; record: Record | null }>({
    open: false,
    record: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await patientAPI.getRecords()
      setRecords((response.data || []).map(normalizeRecord))
    } catch (error) {
      console.error('Error fetching records:', error)
      toast.error('Failed to load records')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (recordId: string) => {
    try {
      const response = await recordsAPI.downloadRecord(recordId)
      // Backend returns plain string URL, not { url: string }
      const url = typeof response.data === 'string' ? response.data : response.data?.url
      if (url) {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
        toast.success('Download started')
      } else {
        toast.info('No file attached to this record')
      }
    } catch (error) {
      toast.error('Failed to download record')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.record) return
    
    setIsDeleting(true)
    try {
      await patientAPI.deleteRecord(deleteModal.record.id)
      setRecords(records.filter(r => r.id !== deleteModal.record!.id))
      toast.success('Record deleted successfully')
      setDeleteModal({ open: false, record: null })
    } catch (error) {
      toast.error('Failed to delete record')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Navbar 
        title="My Records" 
        subtitle="View and manage your medical records"
      />

      {/* Search & Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass pl-12 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
            <Button variant="secondary" icon={<Calendar className="w-4 h-4" />}>
              Date
            </Button>
          </div>
        </div>
      </Card>

      {/* Records List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <RecordSkeleton />
            <RecordSkeleton />
            <RecordSkeleton />
          </>
        ) : filteredRecords.length > 0 ? (
          <AnimatePresence>
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{record.title}</h3>
                      {record.description && (
                        <p className="text-sm text-slate-500 truncate">{record.description}</p>
                      )}
                      <p className="text-sm text-slate-400 mt-1">
                        Uploaded on {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(record.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(record.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteModal({ open: true, record })}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No records found</h3>
            <p className="text-slate-500">
              {searchTerm ? 'Try adjusting your search' : 'Upload your first medical record to get started'}
            </p>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, record: null })}
        title="Delete Record"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete <strong>{deleteModal.record?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button 
            variant="secondary" 
            onClick={() => setDeleteModal({ open: false, record: null })}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
