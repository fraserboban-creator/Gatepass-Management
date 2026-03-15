'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cardVariants } from '@/lib/animations';
import { useEffect, useState } from 'react';

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
  loading = false,
  delay = 0,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter effect
  useEffect(() => {
    if (loading || !value) return;
    
    const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = numValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading]);

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="skeleton-text w-24 mb-3 shimmer"></div>
            <div className="skeleton-text w-16 h-8 mb-2 shimmer"></div>
            <div className="skeleton-text w-20 shimmer"></div>
          </div>
          <div className="skeleton-circle w-12 h-12 shimmer"></div>
        </div>
      </div>
    );
  }

  const variants = {
    ...cardVariants,
    animate: {
      ...cardVariants.animate,
      transition: {
        ...cardVariants.animate.transition,
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
      className={`card ${onClick ? 'cursor-pointer' : ''} group overflow-hidden relative`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <motion.p 
            className="text-sm font-medium text-[var(--text-secondary)] mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.1, duration: 0.3 }}
          >
            {title}
          </motion.p>
          <motion.h3 
            className="text-3xl font-bold text-[var(--text-primary)] mb-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.5, type: 'spring' }}
          >
            {displayValue}
          </motion.h3>
          {(trend || trendValue) && (
            <motion.div 
              className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3, duration: 0.3 }}
            >
              {getTrendIcon()}
              <span>{trendValue}</span>
            </motion.div>
          )}
        </div>
        {Icon && (
          <motion.div 
            className={`p-3 rounded-xl ${colorClasses[color]} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.5, type: 'spring' }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
