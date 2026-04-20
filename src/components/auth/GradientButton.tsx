import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps {
  type?: 'button' | 'submit'
  onClick?: () => void
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
  disabled?: boolean
}

export default function GradientButton({
  type = 'button',
  onClick,
  isLoading = false,
  loadingText = 'Loading...',
  children,
  disabled = false
}: GradientButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        relative w-full py-4 px-6 rounded-xl font-semibold text-white
        bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500
        overflow-hidden transition-all duration-300
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30
        flex items-center justify-center gap-2
      `}
    >
      {/* Shine Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatDelay: 3,
          ease: 'easeInOut'
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
      />
      
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  )
}
