import { jwtDecode } from 'jwt-decode'
import type { User, UserRole, UserStatus } from '../context/AuthContext'

interface MediVaultJwtPayload {
  sub?: string
  role?: string
  status?: string
}

const normalizeUserRole = (role?: string): UserRole => {
  if (role === 'ROLE_DOCTOR' || role === 'DOCTOR') return 'DOCTOR'
  if (role === 'ROLE_PATIENT' || role === 'PATIENT') return 'PATIENT'
  return 'ADMIN'
}

const normalizeUserStatus = (status?: string): UserStatus | undefined => {
  if (
    status === 'ACTIVE' ||
    status === 'PENDING' ||
    status === 'APPROVED' ||
    status === 'REJECTED'
  ) {
    return status
  }

  return undefined
}

export const decodeAuthToken = (token: string) => {
  const decoded = jwtDecode<MediVaultJwtPayload>(token)

  console.log('Decoded JWT:', decoded)

  return {
    username: decoded.sub || '',
    role: normalizeUserRole(decoded.role),
    status: normalizeUserStatus(decoded.status)
  }
}

export const buildUserFromToken = (
  token: string,
  fallback?: Partial<User>
): User => {
  const decoded = decodeAuthToken(token)

  return {
    // decoded.sub is always the numeric user ID from the JWT — never override with email
    id: decoded.username || fallback?.id || 'current-user',
    username: fallback?.username || decoded.username || fallback?.email || 'current-user',
    role: fallback?.role || decoded.role,
    status: fallback?.status || decoded.status,
    email: fallback?.email,
    name: fallback?.name
  }
}
