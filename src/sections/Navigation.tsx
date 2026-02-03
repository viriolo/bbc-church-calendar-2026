import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarDays, 
  List,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import type { CalendarView } from '../types';

interface NavigationProps {
  isScrolled: boolean;
  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'list', label: 'Upcoming Events', icon: List },
  { id: 'month', label: 'Calendar', icon: CalendarDays },
];

export default function Navigation({ isScrolled, calendarView, setCalendarView }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (itemId: string) => {
    // Scroll to section based on nav item
    if (itemId === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (itemId === 'month') {
      const calendarSection = document.getElementById('calendar-section');
      calendarSection?.scrollIntoView({ behavior: 'smooth' });
    } else if (itemId === 'list') {
      const eventsSection = document.getElementById('events-section');
      eventsSection?.scrollIntoView({ behavior: 'smooth' });
    }
    
    setCalendarView({
      type: itemId as CalendarView['type'],
      currentDate: new Date(),
    });
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-2'
          : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.nav
          className={`flex items-center justify-between transition-all duration-500 ${
            isScrolled
              ? 'glass rounded-2xl px-6 py-3 shadow-lg shadow-slate-200/50'
              : 'bg-transparent px-2 py-2'
          }`}
        >
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-800/30">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                BBC 2026 Calendar
              </h1>
              <p className="text-xs text-slate-500 scripture">Colossians 1:28-29</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = calendarView.type === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'text-blue-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-blue-100 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </motion.nav>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          className="lg:hidden overflow-hidden"
        >
          <div className="glass rounded-2xl mt-2 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
