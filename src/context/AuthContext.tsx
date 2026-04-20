import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { buildUserFromToken } from '../lib/auth'

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  username: string
  role: UserRole
  status?: UserStatus
  email?: string
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user?: User) => User
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('medivault_token')
    const storedUser = localStorage.getItem('medivault_user')
    
    if (storedToken) {
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) as User : undefined
        const hydratedUser = buildUserFromToken(storedToken, parsedUser)

        setToken(storedToken)
        setUser(hydratedUser)
        localStorage.setItem('medivault_user', JSON.stringify(hydratedUser))
        localStorage.setItem('token', storedToken)
        localStorage.setItem('role', hydratedUser.role)
        if (hydratedUser.status) {
          localStorage.setItem('status', hydratedUser.status)
        } else {
          localStorage.removeItem('status')
        }
      } catch (error) {
        console.error('Failed to restore auth state from token:', error)
        localStorage.removeItem('medivault_token')
        localStorage.removeItem('medivault_user')
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('status')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser?: User) => {
    const resolvedUser = buildUserFromToken(newToken, newUser)

    setToken(newToken)
    setUser(resolvedUser)
    localStorage.setItem('medivault_token', newToken)
    localStorage.setItem('medivault_user', JSON.stringify(resolvedUser))
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', resolvedUser.role)
    if (resolvedUser.status) {
      localStorage.setItem('status', resolvedUser.status)
    } else {
      localStorage.removeItem('status')
    }

    return resolvedUser
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('medivault_token')
    localStorage.removeItem('medivault_user')
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('status')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('medivault_user', JSON.stringify(updatedUser))
    localStorage.setItem('role', updatedUser.role)
    if (updatedUser.status) {
      localStorage.setItem('status', updatedUser.status)
    } else {
      localStorage.removeItem('status')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
