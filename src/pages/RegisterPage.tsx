import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, ArrowRight, AlertCircle, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { toast } from 'sonner'
import type { UserRole } from '../context/AuthContext'
import { decodeAuthToken } from '../lib/auth'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/auth/InputField'
import RoleSelector from '../components/auth/RoleSelector'
import GradientButton from '../components/auth/GradientButton'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('PATIENT')
  const [icmrId, setIcmrId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const serializeRegisterRole = (selectedRole: UserRole) =>
    selectedRole === 'DOCTOR' ? 'ROLE_DOCTOR' : 'ROLE_PATIENT'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setIsLoading(true)

    try {
      const payload = {
        username: username?.trim() || '',
        email: email?.trim() || '',
        password: password?.trim() || '',
        role: serializeRegisterRole(role),
        icmrId: role === 'DOCTOR' ? icmrId.trim().toUpperCase() : undefined,
      }

      console.log('=== REGISTER PAYLOAD ===')
      console.log(JSON.stringify(payload, null, 2))

      if (!payload.username || !payload.email || !payload.password) {
        setError('All fields are required')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        setError('Please enter a valid email')
        return
      }

      if (payload.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      // ICMR ID required for doctors
      if (role === 'DOCTOR' && !icmrId.trim()) {
        setError('ICMR ID is required for doctor registration')
        return
      }

      const response = await authAPI.register(payload)

      console.log('SUCCESS:', response.data)

      const { accessToken, role: responseRole, status: responseStatus } = response.data
      if (typeof accessToken === 'string' && accessToken.trim()) {
        const decoded = decodeAuthToken(accessToken)
        const user = login(accessToken, {
          id: response.data.id || response.data.userId || username,
          username: payload.username || decoded.username,
          email: payload.email,
          role: decoded.role || responseRole,
          status: decoded.status || responseStatus
        })

        toast.success('Account created successfully!')

        if (user.role === 'DOCTOR' && user.status === 'REJECTED') {
          navigate('/locked-dashboard')
        } else if (user.role === 'DOCTOR' && user.status !== 'APPROVED') {
          navigate('/pending-approval')
        } else {
          navigate(user.role === 'PATIENT' ? '/patient' : '/doctor')
        }
        return
      }

      toast.success('Account created successfully! Please sign in.')

      if (role === 'DOCTOR') {
        navigate('/pending-approval')
      } else {
        navigate('/login')
      }
    } catch (error: any) {
      console.log('=== FULL ERROR DEBUG ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)

      const errorMessage =
        error.response?.data?.details?.role ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        'Registration failed'

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join MediVault to securely manage your health records"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <RoleSelector value={role} onChange={setRole} />

        <InputField
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          placeholder="Choose a username"
          icon={<User className="w-5 h-5" />}
          disabled={isLoading}
        />

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
          icon={<Mail className="w-5 h-5" />}
          disabled={isLoading}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          icon={<Lock className="w-5 h-5" />}
          disabled={isLoading}
          showPasswordToggle
        />

        <InputField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm your password"
          icon={<Lock className="w-5 h-5" />}
          disabled={isLoading}
        />

        {/* ICMR ID — doctors only */}
        <AnimatePresence>
          {role === 'DOCTOR' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <InputField
                label="ICMR Registration ID"
                type="text"
                value={icmrId}
                onChange={setIcmrId}
                placeholder="e.g. ICMR-MH-123456"
                icon={<ShieldCheck className="w-5 h-5" />}
                disabled={isLoading}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-2 px-1"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-600 font-medium">
                  Your ICMR ID will be verified by an admin before your account is approved.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-2">
          <GradientButton 
            type="submit" 
            isLoading={isLoading}
            loadingText="Creating account..."
          >
            Create Account
            <ArrowRight className="w-5 h-5" />
          </GradientButton>
        </div>
      </form>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <p className="text-slate-500">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
