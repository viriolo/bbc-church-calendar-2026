"use client";

import { motion } from "framer-motion";

export function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      {/* Background decorative circles */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-blue-200/50 to-amber-200/50 blur-2xl"
      />
      
      {/* Main church illustration using SVG */}
      <svg viewBox="0 0 400 300" className="w-full max-w-md h-auto relative z-10">
        {/* Church building */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Main building body */}
          <rect x="120" y="120" width="160" height="140" fill="#1e3a8a" rx="4" />
          
          {/* Roof */}
          <path d="M110 120 L200 40 L290 120 Z" fill="#1e40af" />
          
          {/* Steeple */}
          <rect x="185" y="20" width="30" height="40" fill="#1e3a8a" />
          <path d="M180 20 L200 0 L220 20 Z" fill="#f59e0b" />
          
          {/* Cross on top */}
          <rect x="196" y="5" width="8" height="20" fill="#f59e0b" />
          <rect x="190" y="11" width="20" height="8" fill="#f59e0b" />
          
          {/* Windows */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <rect x="140" y="150" width="30" height="50" fill="#dbeafe" rx="15" />
            <rect x="185" y="150" width="30" height="50" fill="#dbeafe" rx="15" />
            <rect x="230" y="150" width="30" height="50" fill="#dbeafe" rx="15" />
          </motion.g>
          
          {/* Door */}
          <motion.g
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            style={{ transformOrigin: "200px 260px" }}
          >
            <rect x="175" y="200" width="50" height="60" fill="#78350f" rx="2" />
            <circle cx="215" cy="230" r="3" fill="#f59e0b" />
          </motion.g>
          
          {/* Steps */}
          <rect x="160" y="260" width="80" height="8" fill="#94a3b8" rx="1" />
          <rect x="155" y="268" width="90" height="8" fill="#94a3b8" rx="1" />
        </motion.g>
        
        {/* Decorative people silhouettes */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.6, x: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <circle cx="80" cy="240" r="12" fill="#64748b" />
          <path d="M65 280 Q80 250 95 280 L95 300 L65 300 Z" fill="#64748b" />
        </motion.g>
        
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.6, x: 0 }}
          transition={{ delay: 1.7, duration: 0.8 }}
        >
          <circle cx="320" cy="240" r="12" fill="#64748b" />
          <path d="M305 280 Q320 250 335 280 L335 300 L305 300 Z" fill="#64748b" />
        </motion.g>
        
        {/* Calendar elements floating around */}
        <motion.circle
          cx="50" cy="80"
          r="20"
          fill="white"
          stroke="#f59e0b"
          strokeWidth="2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        />
        <motion.text
          x="50" y="85"
          textAnchor="middle"
          fill="#1e3a8a"
          fontSize="14"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          2026
        </motion.text>
        
        {/* Decorative sparkles */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <text x="350" y="60" fontSize="20" fill="#f59e0b">✦</text>
        </motion.g>
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <text x="40" y="200" fontSize="16" fill="#3b82f6">✦</text>
        </motion.g>
      </svg>
      
      {/* Quarter badge floating */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-4 bg-gradient-to-br from-amber-400 to-amber-500 text-white px-4 py-2 rounded-xl shadow-lg"
      >
        <span className="font-bold">Q1</span>
      </motion.div>
    </div>
  );
}
