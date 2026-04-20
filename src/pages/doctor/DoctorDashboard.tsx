import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import DoctorHome from './DoctorHome'
import DoctorSearch from './DoctorSearch'
import DoctorPatients from './DoctorPatients'
import DoctorSessions from './DoctorSessions'

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen">
      <Sidebar userRole="DOCTOR" />
      
      <main className="lg:ml-80 p-4 lg:p-8 pt-20 lg:pt-8">
        <Routes>
          <Route index element={<DoctorHome />} />
          <Route path="search" element={<DoctorSearch />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="sessions" element={<DoctorSessions />} />
        </Routes>
      </main>
    </div>
  )
}
