import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  TrendingUp
} from 'lucide-react';

interface EventsSummaryProps {
  totalEvents: number;
  confirmedEvents: number;
  pendingEvents: number;
  needsAttention: number;
}

function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(easeOut * value));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{displayValue}</span>;
}

export default function EventsSummary({ 
  totalEvents, 
  confirmedEvents, 
  pendingEvents, 
  needsAttention 
}: EventsSummaryProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    {
      label: 'Total Events',
      value: totalEvents,
      icon: Calendar,
      color: 'blue',
      description: 'Events this year',
    },
    {
      label: 'Confirmed',
      value: confirmedEvents,
      icon: CheckCircle2,
      color: 'emerald',
      description: 'Ready to go',
    },
    {
      label: 'Pending',
      value: pendingEvents,
      icon: Clock,
      color: 'amber',
      description: 'Awaiting confirmation',
    },
    {
      label: 'Needs Attention',
      value: needsAttention,
      icon: AlertCircle,
      color: 'rose',
      description: 'Drafts & sponsorship',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  };

  return (
    <section ref={ref} className="py-20 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-blue-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-amber-100/50 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" />
            Events Summary
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            2026 Overview
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Track all church events, activities, and planning status at a glance.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = colorClasses[stat.color];
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className={`relative ${colors.bg} rounded-2xl p-6 border ${colors.border} hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                  </div>
                  
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    <AnimatedNumber value={stat.value} />
                  </p>
                  <p className="font-semibold text-slate-700">{stat.label}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stat Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(confirmedEvents / totalEvents) * 100}%` } : {}}
                  transition={{ delay: 0.7, duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                />
              </div>
            </div>
            <span className="text-sm font-medium text-slate-600">
              {Math.round((confirmedEvents / totalEvents) * 100)}% Confirmed
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
