import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Home, Phone, ShieldAlert, UserRound } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { patientAPI } from '../../services/api'
import { toast } from 'sonner'

interface PatientProfileForm {
  firstName: string
  lastName: string
  dateOfBirth: string
  address: string
  phone: string
  emergencyContact: string
}

const emptyForm: PatientProfileForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  address: '',
  phone: '',
  emergencyContact: ''
}

export default function PatientProfileSetupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<PatientProfileForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await patientAPI.getProfile()
        const profile = response.data || {}

        setForm({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          dateOfBirth: profile.dateOfBirth || '',
          address: profile.address || '',
          phone: profile.phone || '',
          emergencyContact: profile.emergencyContact || ''
        })
        setHasExistingProfile(true)
      } catch (error: any) {
        if (error.response?.status !== 404) {
          toast.error('Failed to load patient profile')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const updateField = (field: keyof PatientProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const updated = { ...current }
        delete updated[field]
        return updated
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const firstName = String(form.firstName || '').trim()
    const lastName = String(form.lastName || '').trim()

    const payload = {
      fullName: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      dateOfBirth: String(form.dateOfBirth || '').trim(),
      address: String(form.address || '').trim(),
      phone: String(form.phone || '').trim(),
      emergencyContact: String(form.emergencyContact || '').trim()
    }

    console.log('=== PATIENT PROFILE PAYLOAD ===')
    console.log(JSON.stringify(payload, null, 2))

    if (
      !payload.fullName ||
      !payload.firstName ||
      !payload.lastName ||
      !payload.dateOfBirth ||
      !payload.address ||
      !payload.phone ||
      !payload.emergencyContact
    ) {
      toast.error('All profile fields are required')
      return
    }

    setIsSaving(true)

    try {
      if (hasExistingProfile) {
        await patientAPI.updateProfile(payload)
      } else {
        await patientAPI.createProfile(payload)
      }

      toast.success(hasExistingProfile ? 'Patient profile updated' : 'Patient profile created')
      navigate('/patient')
    } catch (error: any) {
      console.log('=== PATIENT PROFILE ERROR ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)

      // Extract field-specific errors from backend response
      const details = error.response?.data?.details || {}
      if (typeof details === 'object' && Object.keys(details).length > 0) {
        setFieldErrors(details)
        toast.error('Please correct the errors below')
      } else {
        toast.error(error.response?.data?.message || 'Failed to save patient profile')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-4xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Navbar
            title="Patient Profile Setup"
            subtitle="Complete your profile before using MediVault"
          />
          <Card className="text-center py-12">
            <p className="text-slate-500">Loading patient profile...</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
        <Navbar
          title={hasExistingProfile ? 'Edit Patient Profile' : 'Patient Profile Setup'}
          subtitle="Complete your personal profile before doctors can request access to your records"
        />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">First Name</span>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      value={form.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className={`input-glass pl-12 w-full ${fieldErrors.firstName ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="John"
                    />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="text-sm text-red-600">{fieldErrors.firstName}</p>
                  )}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Last Name</span>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      value={form.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className={`input-glass pl-12 w-full ${fieldErrors.lastName ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="Doe"
                    />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="text-sm text-red-600">{fieldErrors.lastName}</p>
                  )}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Date of Birth</span>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className={`input-glass pl-12 w-full ${fieldErrors.dateOfBirth ? 'border-red-500 bg-red-50' : ''}`}
                    />
                  </div>
                  {fieldErrors.dateOfBirth && (
                    <p className="text-sm text-red-600">{fieldErrors.dateOfBirth}</p>
                  )}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Phone</span>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={`input-glass pl-12 w-full ${fieldErrors.phone ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="+1234567890"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-sm text-red-600">{fieldErrors.phone}</p>
                  )}
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <div className="relative">
                  <Home className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className={`input-glass pl-12 min-h-24 w-full resize-none ${fieldErrors.address ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="123 Main Street"
                  />
                </div>
                {fieldErrors.address && (
                  <p className="text-sm text-red-600">{fieldErrors.address}</p>
                )}
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-slate-700">Emergency Contact</span>
                <div className="relative">
                  <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={form.emergencyContact}
                    onChange={(e) => updateField('emergencyContact', e.target.value)}
                    className={`input-glass pl-12 w-full ${fieldErrors.emergencyContact ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="Jane Doe - +1234567890"
                  />
                </div>
                {fieldErrors.emergencyContact && (
                  <p className="text-sm text-red-600">{fieldErrors.emergencyContact}</p>
                )}
              </label>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving} icon={<UserRound className="w-4 h-4" />}>
                  {hasExistingProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
