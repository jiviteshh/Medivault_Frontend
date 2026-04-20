import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25"
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 font-medium"
        >
          Loading MediVault...
        </motion.p>
      </motion.div>
    </div>
  )
}
