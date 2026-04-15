'use client';

import { motion } from 'framer-motion';

export default function AnimatedLoadingScreen() {
  // Spinner animation variants
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  // Dot animation variants for pulse effect
  const dotVariants = {
    animate: (i) => ({
      y: [0, -10, 0],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        delay: i * 0.2,
        ease: 'easeInOut',
      },
    }),
  };

  // Title animation
  const titleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  // Subtitle animation
  const subtitleVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: 'easeOut',
      },
    },
  };

  // Container animation
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 z-50">
      <motion.div
        className="flex flex-col items-center justify-center gap-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Animated Logo/Icon */}
        <motion.div
          className="relative w-24 h-24"
          variants={spinnerVariants}
          animate="animate"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400"></div>

          {/* Inner circle */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-300 opacity-50"></div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div variants={titleVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center">
            Hostel Gatepass
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-blue-600 text-center mt-1">
            Management System
          </h2>
        </motion.div>

        {/* Loading text with animated dots */}
        <motion.div
          className="flex items-center gap-2"
          variants={subtitleVariants}
        >
          <span className="text-slate-600 font-medium">Loading</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                variants={dotVariants}
                custom={i}
                animate="animate"
              />
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden"
          variants={subtitleVariants}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
            animate={{
              width: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-sm text-slate-500 text-center max-w-xs"
          variants={subtitleVariants}
        >
          Initializing your secure gatepass system...
        </motion.p>
      </motion.div>
    </div>
  );
}
