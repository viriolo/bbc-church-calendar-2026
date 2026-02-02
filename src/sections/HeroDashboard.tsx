import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { 
  AlertCircle, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock,
  TrendingUp
} from 'lucide-react';
import type { Quarter, Stats } from '../types';

interface HeroDashboardProps {
  quarter: Quarter;
  stats: Stats;
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

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  delay 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  color: string;
  delay: number;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        delay, 
        duration: 0.6, 
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 2,
        transition: { duration: 0.2 }
      }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-slate-100 card-hover">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <motion.div 
            className="text-3xl font-bold text-slate-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            <AnimatedNumber value={value} />
          </motion.div>
        </div>
        <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default function HeroDashboard({ quarter, stats }: HeroDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-100/50 via-transparent to-transparent rounded-full"
        />
        
        {/* Sacred Geometry Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100">
          <defs>
            <pattern id="flower-of-life" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="10" cy="2" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="10" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="2" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="18" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#flower-of-life)"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Quarter Theme */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            {/* Quarter Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-sm font-semibold text-blue-800">
                {quarter.name}: {quarter.theme}
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4"
            >
              <span className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 bg-clip-text text-transparent">
                Boroko Baptist
              </span>
              <br />
              <span className="text-slate-700">Church Calendar</span>
            </motion.h1>

            {/* Scripture Quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-lg scripture text-slate-600 italic"
            >
              &ldquo;To Present Everyone Mature In Christ&rdquo;
              <cite className="block mt-2 text-sm not-italic font-medium text-slate-500">
                — Colossians 1:28-29
              </cite>
            </motion.blockquote>

            {/* Quick Action - Scroll to Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                View Calendar
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={AlertCircle}
              label="Needs Attention"
              value={stats.needsAttention}
              color="rose"
              delay={0.4}
            />
            <StatCard
              icon={Calendar}
              label="Upcoming Events"
              value={stats.upcoming}
              color="amber"
              delay={0.5}
            />
            <StatCard
              icon={Users}
              label="Active Ministries"
              value={stats.ministries}
              color="blue"
              delay={0.6}
            />
            <StatCard
              icon={CheckCircle2}
              label="Confirmed Events"
              value={stats.confirmedEvents}
              color="emerald"
              delay={0.7}
            />
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <div className="glass rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-500">Total Events</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  <AnimatedNumber value={stats.totalEvents} />
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-500">Confirmed</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  <AnimatedNumber value={stats.confirmedEvents} />
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-500">Pending</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  <AnimatedNumber value={stats.pendingEvents} />
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-500">This Month</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">18</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
