import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PatientHome from './PatientHome'
import PatientRecords from './PatientRecords'
import PatientUpload from './PatientUpload'
import PatientRequests from './PatientRequests'
import PatientSessions from './PatientSessions'

export default function PatientDashboard() {
  return (
    <div className="min-h-screen">
      <Sidebar userRole="PATIENT" />
      
      <main className="lg:ml-80 p-4 lg:p-8 pt-20 lg:pt-8">
        <Routes>
          <Route index element={<PatientHome />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="upload" element={<PatientUpload />} />
          <Route path="requests" element={<PatientRequests />} />
          <Route path="sessions" element={<PatientSessions />} />
        </Routes>
      </main>
    </div>
  )
}
