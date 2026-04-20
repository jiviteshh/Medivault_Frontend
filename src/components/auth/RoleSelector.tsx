import { motion } from 'framer-motion'
import { UserCircle, Stethoscope } from 'lucide-react'
import type { UserRole } from '../../context/AuthContext'

interface RoleSelectorProps {
  value: UserRole
  onChange: (role: UserRole) => void
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-600">I am a</label>
      <div className="grid grid-cols-2 gap-4">
        <RoleCard
          role="PATIENT"
          icon={<UserCircle className="w-8 h-8" />}
          label="Patient"
          description="Manage my records"
          isSelected={value === 'PATIENT'}
          onClick={() => onChange('PATIENT')}
          color="sky"
        />
        <RoleCard
          role="DOCTOR"
          icon={<Stethoscope className="w-8 h-8" />}
          label="Doctor"
          description="Access patient data"
          isSelected={value === 'DOCTOR'}
          onClick={() => onChange('DOCTOR')}
          color="teal"
        />
      </div>
    </div>
  )
}

interface RoleCardProps {
  role: UserRole
  icon: React.ReactNode
  label: string
  description: string
  isSelected: boolean
  onClick: () => void
  color: 'sky' | 'teal'
}

function RoleCard({ icon, label, description, isSelected, onClick, color }: RoleCardProps) {
  const colorClasses = {
    sky: {
      selected: 'border-sky-500 bg-gradient-to-br from-sky-50 to-cyan-50 shadow-lg shadow-sky-500/20',
      icon: 'text-sky-600',
      glow: 'bg-sky-500'
    },
    teal: {
      selected: 'border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-lg shadow-teal-500/20',
      icon: 'text-teal-600',
      glow: 'bg-teal-500'
    }
  }

  const colors = colorClasses[color]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-5 rounded-2xl border-2 transition-all duration-300
        flex flex-col items-center gap-2 text-center overflow-hidden
        ${isSelected 
          ? colors.selected
          : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white'
        }
      `}
    >
      {/* Glow Effect */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute -top-10 -right-10 w-24 h-24 ${colors.glow} rounded-full blur-3xl opacity-20`}
        />
      )}
      
      <div className={`relative ${isSelected ? colors.icon : 'text-slate-400'} transition-colors`}>
        {icon}
      </div>
      <span className={`font-semibold ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className={`text-xs ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
        {description}
      </span>
      
      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-2 right-2 w-3 h-3 rounded-full ${colors.glow}`}
        />
      )}
    </motion.button>
  )
}
