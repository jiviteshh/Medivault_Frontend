import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, CheckCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FileUpload from '../../components/ui/FileUpload'
import { patientAPI } from '../../services/api'
import { toast } from 'sonner'

export default function PatientUpload() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a title for the record')
      return
    }

    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)
    try {
      await patientAPI.uploadRecord(
        [file],
        { title, description }
      )
      setUploadSuccess(true)
      toast.success('Record uploaded successfully!')
      
      setTimeout(() => {
        navigate('/patient/records')
      }, 2000)
    } catch (error) {
      toast.error('Failed to upload record')
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadSuccess) {
    return (
      <div>
        <Navbar title="Upload Record" subtitle="Add new medical records to your vault" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto"
        >
          <Card className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Successful!</h2>
            <p className="text-slate-500">Your medical record has been securely stored.</p>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      <Navbar title="Upload Record" subtitle="Add new medical records to your vault" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Record Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Blood Test Results - March 2024"
                  className="input-glass pl-12"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes or description about this record..."
                rows={3}
                className="input-glass resize-none"
                disabled={isUploading}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                File <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelect={setFile}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                maxSize={10}
              />
              <p className="text-xs text-slate-500">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/patient/records')}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isUploading}>
                Upload Record
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
