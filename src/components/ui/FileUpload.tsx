import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in MB
}

export default function FileUpload({ 
  onFileSelect, 
  accept = '*/*',
  maxSize = 10 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }, [maxSize, onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{ 
          borderColor: isDragging ? '#0ea5e9' : '#e2e8f0',
          backgroundColor: isDragging ? 'rgba(14, 165, 233, 0.05)' : 'rgba(255, 255, 255, 0.5)'
        }}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer',
          'hover:border-primary-400 hover:bg-primary-50/30',
          selectedFile && 'border-green-400 bg-green-50/30'
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4 text-center">
          {selectedFile ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Remove file
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  Drop your file here, or <span className="text-primary-600">browse</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Maximum file size: {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  )
}
