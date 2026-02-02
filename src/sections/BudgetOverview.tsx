import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface BudgetCategory {
  name: string;
  amount: number;
  color: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}

// This would ideally come from props or a data store
const budgetData = {
  total: 15200,
  approved: 8750,
  pending: 6450,
  categories: [
    { name: 'Full Breakfasts', amount: 2000, color: '#3b82f6', icon: Wallet, trend: 'up' as const },
    { name: 'Family Camp', amount: 5000, color: '#f59e0b', icon: PieChart, trend: 'neutral' as const },
    { name: 'Special Events', amount: 4500, color: '#10b981', icon: CheckCircle2, trend: 'down' as const },
    { name: 'Sponsorship Needed', amount: 3700, color: '#f43f5e', icon: AlertCircle, trend: 'up' as const },
  ] as BudgetCategory[],
};

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  if (isInView && displayValue === 0) {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / 1000, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default function BudgetOverview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const approvedPercentage = (budgetData.approved / budgetData.total) * 100;
  const pendingPercentage = (budgetData.pending / budgetData.total) * 100;

  // Calculate donut segments
  const totalCategories = budgetData.categories.reduce((sum, cat) => sum + cat.amount, 0);
  let currentAngle = 0;
  const segments = budgetData.categories.map((category) => {
    const percentage = (category.amount / totalCategories) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...category,
      percentage,
      startAngle,
      endAngle: currentAngle,
    };
  });

  const getSegmentPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = 100 + outerRadius * Math.cos(startRad);
    const y1 = 100 + outerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(endRad);
    const y2 = 100 + outerRadius * Math.sin(endRad);
    
    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-4">
            <Wallet className="w-4 h-4" />
            Budget Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Financial Summary
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Track event budgets, sponsorships, and financial planning for church activities.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="30"
                />
                
                {/* Segments */}
                {segments.map((segment, index) => (
                  <motion.path
                    key={segment.name}
                    d={getSegmentPath(segment.startAngle, segment.endAngle, 55, 85)}
                    fill={segment.color}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    style={{
                      transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: '100px 100px',
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm text-slate-500 font-medium">Total Budget</span>
                <span className="text-3xl font-bold text-slate-900">
                  K<AnimatedNumber value={budgetData.total} />
                </span>
                <span className="text-sm text-emerald-600 font-medium mt-1">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  {approvedPercentage.toFixed(0)}% Approved
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="space-y-4">
            {/* Main Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Approved</span>
                </div>
                <p className="text-3xl font-bold">
                  K<AnimatedNumber value={budgetData.approved} />
                </p>
                <p className="text-sm opacity-75 mt-1">{approvedPercentage.toFixed(1)}% of total</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Pending</span>
                </div>
                <p className="text-3xl font-bold">
                  K<AnimatedNumber value={budgetData.pending} />
                </p>
                <p className="text-sm opacity-75 mt-1">{pendingPercentage.toFixed(1)}% of total</p>
              </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="bg-slate-50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {budgetData.categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{category.name}</p>
                          <p className="text-sm text-slate-500">
                            {((category.amount / totalCategories) * 100).toFixed(1)}% of items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">{category.amount}</span>
                        {category.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-rose-500" />}
                        {category.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
