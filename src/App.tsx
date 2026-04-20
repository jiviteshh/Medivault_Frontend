import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientProfileSetupPage from './pages/patient/PatientProfileSetupPage'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import PendingApprovalPage from './pages/doctor/PendingApprovalPage'
import LockedDashboard from './pages/doctor/LockedDashboard'
import DoctorProfileSetupPage from './pages/doctor/DoctorProfileSetupPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import LoadingScreen from './components/LoadingScreen'
import { doctorAPI, patientAPI } from './services/api'

function getDoctorStatusRoute(status?: string) {
  return status === 'REJECTED' ? '/locked-dashboard' : '/pending-approval'
}

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode
  allowedRoles?: ('PATIENT' | 'DOCTOR' | 'ADMIN')[]
}) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'PATIENT') return <Navigate to="/patient" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor" replace />
  }

  // Redirect non-approved doctors to the correct status page
  if (user?.role === 'DOCTOR' && user?.status !== 'APPROVED') {
    return <Navigate to={getDoctorStatusRoute(user.status)} replace />
  }

  return <>{children}</>
}

function DoctorProfileProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkProfile = async () => {
      if (!isAuthenticated || user?.role !== 'DOCTOR' || user?.status !== 'APPROVED') {
        if (isMounted) {
          setIsCheckingProfile(false)
          setHasProfile(true)
        }
        return
      }

      try {
        await doctorAPI.getProfile()
        if (isMounted) {
          setHasProfile(true)
        }
      } catch (error: any) {
        if (isMounted) {
          setHasProfile(error.response?.status !== 404)
        }
      } finally {
        if (isMounted) {
          setIsCheckingProfile(false)
        }
      }
    }

    setIsCheckingProfile(true)
    checkProfile()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.role, user?.status])

  if (isLoading || isCheckingProfile) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'DOCTOR') {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'PATIENT') return <Navigate to="/patient" replace />
    return <Navigate to="/login" replace />
  }

  if (user.status !== 'APPROVED') {
    return <Navigate to={getDoctorStatusRoute(user.status)} replace />
  }

  if (!hasProfile) {
    return <Navigate to="/doctor/setup-profile" replace />
  }

  return <>{children}</>
}

function PatientProfileProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkProfile = async () => {
      if (!isAuthenticated || user?.role !== 'PATIENT') {
        if (isMounted) {
          setIsCheckingProfile(false)
          setHasProfile(true)
        }
        return
      }

      try {
        await patientAPI.getProfile()
        if (isMounted) {
          setHasProfile(true)
        }
      } catch (error: any) {
        if (isMounted) {
          setHasProfile(error.response?.status !== 404)
        }
      } finally {
        if (isMounted) {
          setIsCheckingProfile(false)
        }
      }
    }

    setIsCheckingProfile(true)
    checkProfile()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.role])

  if (isLoading || isCheckingProfile) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'PATIENT') {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'DOCTOR') return <Navigate to={user.status !== 'APPROVED' ? getDoctorStatusRoute(user.status) : '/doctor'} replace />
    return <Navigate to="/login" replace />
  }

  if (!hasProfile) {
    return <Navigate to="/patient/setup-profile" replace />
  }

  return <>{children}</>
}

function PatientProfileSetupRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'PATIENT') {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'DOCTOR') return <Navigate to={user.status !== 'APPROVED' ? getDoctorStatusRoute(user.status) : '/doctor'} replace />
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function DoctorProfileSetupRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'DOCTOR') {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'PATIENT') return <Navigate to="/patient" replace />
    return <Navigate to="/login" replace />
  }

  if (user.status !== 'APPROVED') {
    return <Navigate to={getDoctorStatusRoute(user.status)} replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated && user) {
    // Redirect based on role and status
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (user.role === 'DOCTOR' && user.status !== 'APPROVED') {
      return <Navigate to={getDoctorStatusRoute(user.status)} replace />
    }
    if (user.role === 'PATIENT') {
      return <Navigate to="/patient" replace />
    }
    return <Navigate to="/doctor" replace />
  }

  return <>{children}</>
}

function PendingApprovalRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Only pending doctors can access this route
  if (user?.role !== 'DOCTOR' || user?.status !== 'PENDING') {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'PATIENT') return <Navigate to="/patient" replace />
    if (user?.role === 'DOCTOR' && user?.status === 'REJECTED') {
      return <Navigate to="/locked-dashboard" replace />
    }
    return <Navigate to="/doctor" replace />
  }

  return <>{children}</>
}

function LockedDashboardRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'DOCTOR' || user?.status !== 'REJECTED') {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'PATIENT') return <Navigate to="/patient" replace />
    if (user?.role === 'DOCTOR' && user?.status === 'PENDING') {
      return <Navigate to="/pending-approval" replace />
    }
    return <Navigate to="/doctor" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Only admins can access this route
  if (user?.role !== 'ADMIN') {
    if (user?.role === 'PATIENT') return <Navigate to="/patient" replace />
    if (user?.role === 'DOCTOR' && user?.status !== 'APPROVED') {
      return <Navigate to={getDoctorStatusRoute(user.status)} replace />
    }
    return <Navigate to="/doctor" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/patient/setup-profile"
        element={
          <PatientProfileSetupRoute>
            <PatientProfileSetupPage />
          </PatientProfileSetupRoute>
        }
      />
      <Route
        path="/patient/*"
        element={
          <PatientProfileProtectedRoute>
            <PatientDashboard />
          </PatientProfileProtectedRoute>
        }
      />
      <Route
        path="/doctor/setup-profile"
        element={
          <DoctorProfileSetupRoute>
            <DoctorProfileSetupPage />
          </DoctorProfileSetupRoute>
        }
      />
      <Route
        path="/doctor/*"
        element={
          <DoctorProfileProtectedRoute>
            <DoctorDashboard />
          </DoctorProfileProtectedRoute>
        }
      />
      <Route
        path="/pending-approval"
        element={
          <PendingApprovalRoute>
            <PendingApprovalPage />
          </PendingApprovalRoute>
        }
      />
      <Route
        path="/locked-dashboard"
        element={
          <LockedDashboardRoute>
            <LockedDashboard />
          </LockedDashboardRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
