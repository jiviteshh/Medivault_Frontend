import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  gradient?: boolean
  hover?: boolean
}

export default function Card({ children, className, gradient, hover }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        gradient
          ? 'bg-gradient-to-br from-primary-500 via-teal-500 to-primary-600 text-white shadow-xl shadow-primary-500/25'
          : 'glass',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
