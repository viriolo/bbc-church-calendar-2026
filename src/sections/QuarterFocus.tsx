import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, Target, ScrollText, ChevronRight } from 'lucide-react';
import type { Quarter } from '../types';

interface QuarterFocusProps {
  quarter: Quarter;
}

export default function QuarterFocus({ quarter }: QuarterFocusProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const focusItems = [
    {
      icon: BookOpen,
      label: 'Study',
      value: quarter.study,
      color: 'blue',
      description: 'Our journey through Scripture',
    },
    {
      icon: Target,
      label: 'Focus',
      value: quarter.focus,
      color: 'amber',
      description: 'Theme for this quarter',
    },
    {
      icon: ScrollText,
      label: 'Scripture',
      value: quarter.scripture,
      color: 'emerald',
      description: 'Key verse to meditate on',
    },
  ];

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-4">
            <Target className="w-4 h-4" />
            Quarter Focus
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {quarter.name}: {quarter.theme}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Journey with us through this quarter&apos;s spiritual focus as we grow together in faith and community.
          </p>
        </motion.div>

        {/* Focus Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {focusItems.map((item, index) => {
            const Icon = item.icon;
            const colorClasses: Record<string, { bg: string; icon: string; border: string; text: string }> = {
              blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', border: 'border-blue-200', text: 'text-blue-800' },
              amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-800' },
              emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', border: 'border-emerald-200', text: 'text-emerald-800' },
            };
            const colors = colorClasses[item.color];

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group"
              >
                <div className={`relative h-full ${colors.bg} rounded-2xl p-6 border ${colors.border} overflow-hidden`}>
                  {/* Hover Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center shadow-lg mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <p className="text-sm font-medium text-slate-500 mb-1">{item.label}</p>
                    <h3 className={`text-xl font-bold ${colors.text} mb-2`}>{item.value}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-8 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Quarter Progress</h3>
              <p className="text-slate-600">
                <span className="font-semibold text-blue-800">{quarter.confirmedEvents}</span> of{' '}
                <span className="font-semibold">{quarter.totalEvents}</span> events confirmed
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-800">{quarter.progress}%</span>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/30"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${quarter.progress}%` } : {}}
                transition={{ delay: 0.7, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 rounded-full relative liquid-progress"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </motion.div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-500">
              <span>Quarter Start</span>
              <span>Quarter End</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
