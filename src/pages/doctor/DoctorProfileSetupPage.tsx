import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, FileBadge, Phone, UserRound, AlignLeft } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { doctorAPI } from '../../services/api'
import { toast } from 'sonner'

const specializationOptions = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'ENT',
  'Gastroenterology',
  'General Medicine',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
  'Other'
] as const

interface DoctorProfileForm {
  fullName: string
  specialization: string
  licenseNumber: string
  contactPhone: string
  bio: string
}

const emptyForm: DoctorProfileForm = {
  fullName: '',
  specialization: '',
  licenseNumber: '',
  contactPhone: '',
  bio: ''
}

export default function DoctorProfileSetupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<DoctorProfileForm>(emptyForm)
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [customSpecialization, setCustomSpecialization] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await doctorAPI.getProfile()
        const profile = response.data || {}

        setForm({
          fullName: profile.fullName || '',
          specialization: profile.specialization || profile.specialty || '',
          licenseNumber: profile.licenseNumber || '',
          contactPhone: profile.contactPhone || '',
          bio: profile.bio || ''
        })
        const existingSpecialization = String(profile.specialization || profile.specialty || '')
        if (specializationOptions.includes(existingSpecialization as (typeof specializationOptions)[number])) {
          setSelectedSpecialization(existingSpecialization)
          setCustomSpecialization('')
        } else if (existingSpecialization) {
          setSelectedSpecialization('Other')
          setCustomSpecialization(existingSpecialization)
        }
        setHasExistingProfile(true)
      } catch (error: any) {
        if (error.response?.status !== 404) {
          toast.error('Failed to load doctor profile')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const updateField = (field: keyof DoctorProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSpecializationChange = (value: string) => {
    setSelectedSpecialization(value)

    if (value === 'Other') {
      updateField('specialization', customSpecialization)
      return
    }

    setCustomSpecialization('')
    updateField('specialization', value)
  }

  const handleCustomSpecializationChange = (value: string) => {
    setCustomSpecialization(value)
    updateField('specialization', value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      fullName: String(form.fullName || '').trim(),
      specialization: String(form.specialization || '').trim(),
      licenseNumber: String(form.licenseNumber || '').trim(),
      contactPhone: String(form.contactPhone || '').trim(),
      bio: String(form.bio || '').trim()
    }

    console.log('=== DOCTOR PROFILE PAYLOAD ===')
    console.log(JSON.stringify(payload, null, 2))

    if (
      !payload.fullName ||
      !payload.specialization ||
      !payload.licenseNumber ||
      !payload.contactPhone ||
      !payload.bio
    ) {
      toast.error('All profile fields are required')
      return
    }

    setIsSaving(true)

    try {
      if (hasExistingProfile) {
        await doctorAPI.updateProfile(payload)
      } else {
        await doctorAPI.createProfile(payload)
      }

      toast.success(hasExistingProfile ? 'Doctor profile updated' : 'Doctor profile created')
      navigate('/doctor')
    } catch (error: any) {
      console.log('=== DOCTOR PROFILE ERROR ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)

      toast.error(error.response?.data?.message || 'Failed to save doctor profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-4xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Navbar
            title="Doctor Profile Setup"
            subtitle="Complete your professional onboarding to access patient requests"
          />
          <Card className="text-center py-12">
            <p className="text-slate-500">Loading doctor profile...</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
        <Navbar
          title={hasExistingProfile ? 'Edit Doctor Profile' : 'Doctor Profile Setup'}
          subtitle="Complete your professional profile before requesting access to patient records"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Full Name</span>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      value={form.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className="input-glass pl-12 w-full"
                      placeholder="John Doe"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Specialization</span>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => handleSpecializationChange(e.target.value)}
                      className="input-glass pl-12 w-full appearance-none"
                    >
                      <option value="">Select specialization</option>
                      {specializationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">License Number</span>
                  <div className="relative">
                    <FileBadge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      value={form.licenseNumber}
                      onChange={(e) => updateField('licenseNumber', e.target.value)}
                      className="input-glass pl-12 w-full"
                      placeholder="MED123456"
                    />
                  </div>
                </label>
              </div>

              {selectedSpecialization === 'Other' && (
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-slate-700">Other Specialization</span>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      value={customSpecialization}
                      onChange={(e) => handleCustomSpecializationChange(e.target.value)}
                      className="input-glass pl-12 w-full"
                      placeholder="Enter your specialization"
                    />
                  </div>
                </label>
              )}

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-slate-700">Contact Phone</span>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={form.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    className="input-glass pl-12 w-full"
                    placeholder="+1234567890"
                  />
                </div>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-slate-700">Professional Bio</span>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    value={form.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    className="input-glass pl-12 min-h-32 w-full resize-none"
                    placeholder="Experienced doctor"
                  />
                </div>
              </label>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving} icon={<Stethoscope className="w-4 h-4" />}>
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
