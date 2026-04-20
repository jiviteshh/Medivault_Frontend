import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medivault_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medivault_token')
      localStorage.removeItem('medivault_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (data: { username: string; email: string; password: string; role: string; icmrId?: string }) => {
    const normalizedRole =
      data.role === 'ROLE_DOCTOR' || data.role === 'DOCTOR'
        ? 'ROLE_DOCTOR'
        : 'ROLE_PATIENT'

    const payload: Record<string, string> = {
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password.trim(),
      role: normalizedRole
    }

    // Include ICMR ID for doctor registration
    if (data.icmrId) {
      payload.icmrId = data.icmrId.trim()
    }

    return api.post('/auth/register', payload)
  },
  login: (data: { email: string; password: string }) => {
    const payload = {
      email: data.email.trim(),
      password: data.password.trim()
    }
    return api.post('/auth/login', payload)
  },
}

// Patient APIs
export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  createProfile: (data: object) => api.post('/patient/profile', data),
  updateProfile: (data: object) => api.put('/patient/profile', data),
  getRecords: () => api.get('/patient/records'),
  uploadRecord: (files: File[], metadata: { title: string; description: string }) => {
    const formData = new FormData()
    // Backend expects @RequestPart("file") — use 'file' as the part name
    files.forEach(file => formData.append('file', file))
    // Remap to backend DTO field names
    formData.append('metadata', JSON.stringify({
      hospitalName: metadata.title,
      doctorSummary: metadata.description,
    }))
    return api.post('/patient/records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getLatestRecord: () => api.get('/patient/records/latest'),
  getRecordHistory: () => api.get('/patient/records/history'),
  deleteRecord: (recordId: string) => api.delete(`/patient/records/${recordId}`),
}

// Doctor APIs
export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile'),
  createProfile: (data: object) => api.post('/doctor/profile', data),
  updateProfile: (data: object) => api.put('/doctor/profile', data),
  getPatientRecords: (patientId: string) => api.get(`/doctor/records/${patientId}`),
  viewRecord: (recordId: string) => api.get(`/doctor/records/view/${recordId}`),
  getActivePatients: () => api.get('/sessions/doctor/active'),
}

// Access Requests APIs
export const accessAPI = {
  // Doctor: POST /access-requests/doctor/{patientUserId}
  requestAccess: (patientUserId: string) => api.post(`/access-requests/doctor/${patientUserId}`),
  // Patient: GET /access-requests/patient  (all statuses)
  getPatientRequests: () => api.get('/access-requests/patient'),
  // Patient: reject via legacy PUT ?status=REJECTED
  updateRequestStatus: (requestId: string, status: 'APPROVED' | 'REJECTED') =>
    api.put(`/access-requests/patient/${requestId}?status=${status}`),
  // Patient: approve with duration — generates access key inside the backend
  // PUT /access-requests/patient/{id}/approve-with-duration?validMinutes=X
  approveWithDuration: (requestId: string, validMinutes: number) =>
    api.put(`/access-requests/patient/${requestId}/approve-with-duration?validMinutes=${validMinutes}`),
}

export const accessKeyAPI = {
  generate: (patientUserId: string, validMinutes: number) => {
    const url = `/access-keys/generate?patientUserId=${encodeURIComponent(patientUserId)}&validMinutes=${validMinutes}`
    return api.post(url)
  },
}

// Session APIs
export const sessionAPI = {
  // PATIENT: get all active sessions (who has access right now)
  getActiveSessions: () => api.get('/sessions/active'),
  // PATIENT: revoke a session by ID
  endSession: (sessionId: string) => api.delete(`/sessions/${sessionId}`),
  // DOCTOR: check if they have an active session with a patient
  validateSession: (patientUserId: string) => api.get(`/sessions/validate/${patientUserId}`),
  startSession: (accessKey: string) => api.post('/sessions/start', { accessKey }),
}

// Records APIs
export const recordsAPI = {
  downloadRecord: (recordId: string) => api.get(`/records/${recordId}/download`),
}

// Admin APIs
export const adminAPI = {
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  approveDoctor: (doctorId: string) => api.put(`/admin/doctors/${doctorId}/approve`),
  rejectDoctor: (doctorId: string) => api.put(`/admin/doctors/${doctorId}/reject`),
}

export default api
