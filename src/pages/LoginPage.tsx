import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { toast } from 'sonner'
import { decodeAuthToken } from '../lib/auth'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/auth/InputField'
import GradientButton from '../components/auth/GradientButton'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email')
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        email: email?.trim() || '',
        password: password?.trim() || ''
      }

      console.log('=== LOGIN PAYLOAD ===')
      console.log(JSON.stringify(payload, null, 2))

      const response = await authAPI.login(payload)

      console.log('=== LOGIN SUCCESS ===')
      console.log(JSON.stringify(response.data, null, 2))

      const { accessToken, role: responseRole, status: responseStatus } = response.data
      const decoded = decodeAuthToken(accessToken)
      const user = login(accessToken, {
        id: response.data.id || payload.email,
        username: response.data.username || decoded.username || payload.email,
        email: payload.email,
        role: decoded.role || responseRole,
        status: decoded.status || responseStatus
      })

      toast.success('Welcome back!')

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (user.role === 'DOCTOR' && user.status === 'REJECTED') {
        navigate('/locked-dashboard')
      } else if (user.role === 'DOCTOR' && user.status !== 'APPROVED') {
        navigate('/pending-approval')
      } else {
        navigate(user.role === 'PATIENT' ? '/patient' : '/doctor')
      }
    } catch (error: any) {
      console.log('=== LOGIN ERROR DEBUG ===')
      console.log('Status:', error.response?.status)
      console.log('Response Data:')
      console.log(JSON.stringify(error.response?.data, null, 2))
      console.log('Full Error:', error)

      const errorMessage =
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        'Invalid credentials'

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to access your health records securely"
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

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
          icon={<User className="w-5 h-5" />}
          disabled={isLoading}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          icon={<Lock className="w-5 h-5" />}
          disabled={isLoading}
          showPasswordToggle
        />

        <div className="pt-2">
          <GradientButton 
            type="submit" 
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
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
          {"Don't have an account? "}
          <Link 
            to="/register" 
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
