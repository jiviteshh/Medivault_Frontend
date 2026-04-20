import { motion } from 'framer-motion'
import { Heart, Shield, Lock, Activity } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500" />
        
        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 -right-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-20 left-1/3 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MediVault</span>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl xl:text-5xl font-bold text-white leading-tight text-balance"
            >
              Your Health Records,
              <br />
              <span className="text-cyan-200">Always Secure.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-lg text-white/80 max-w-md"
            >
              Secure. Private. Your Health, Always. Access and manage your medical records with enterprise-grade security.
            </motion.p>

            {/* Floating Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 grid grid-cols-2 gap-4 max-w-md"
            >
              <FloatingCard 
                icon={<Shield className="w-5 h-5" />}
                title="HIPAA Compliant"
                delay={0.7}
              />
              <FloatingCard 
                icon={<Lock className="w-5 h-5" />}
                title="End-to-End Encrypted"
                delay={0.8}
              />
              <FloatingCard 
                icon={<Activity className="w-5 h-5" />}
                title="Real-time Access"
                delay={0.9}
              />
              <FloatingCard 
                icon={<Heart className="w-5 h-5" />}
                title="Patient First"
                delay={1.0}
              />
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-sm text-white/60"
          >
            Trusted by healthcare providers worldwide
          </motion.p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md lg:max-w-lg xl:ml-[-40px]"
        >
          {/* Mobile Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex lg:hidden items-center justify-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">MediVault</span>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 p-8 sm:p-10"
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{title}</h2>
              <p className="mt-2 text-slate-500">{subtitle}</p>
            </div>

            {children}
          </motion.div>

          {/* Trust Badges - Mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex lg:hidden items-center justify-center gap-6 mt-8 text-xs text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Encrypted</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function FloatingCard({ icon, title, delay }: { icon: React.ReactNode; title: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 cursor-default"
    >
      <div className="flex items-center gap-3">
        <div className="text-white/90">{icon}</div>
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
    </motion.div>
  )
}
