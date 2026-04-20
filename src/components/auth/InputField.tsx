import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

interface InputFieldProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon: React.ReactNode
  disabled?: boolean
  showPasswordToggle?: boolean
}

export default function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  disabled = false,
  showPasswordToggle = false
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <div className="relative">
        <motion.div
          animate={{
            color: isFocused ? '#0ea5e9' : '#94a3b8'
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
        >
          {icon}
        </motion.div>
        <motion.input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full pl-12 pr-${showPasswordToggle ? '12' : '4'} py-3.5 
            rounded-xl bg-slate-50/80 border-2 
            outline-none transition-all duration-300
            placeholder:text-slate-400 text-slate-700
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFocused 
              ? 'border-sky-400 bg-white shadow-lg shadow-sky-500/10' 
              : 'border-slate-200 hover:border-slate-300'
            }
          `}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  )
}
