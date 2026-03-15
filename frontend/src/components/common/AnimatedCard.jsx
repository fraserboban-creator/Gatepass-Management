'use client';

import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations';

export default function AnimatedCard({ 
  children, 
  className = '', 
  onClick,
  whileHover = true,
  delay = 0 
}) {
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
      whileHover={whileHover ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  );
}
