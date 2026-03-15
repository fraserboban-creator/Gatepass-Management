'use client';

import { motion } from 'framer-motion';

export default function AnimatedButton({ 
  children, 
  className = '', 
  onClick,
  disabled = false,
  type = 'button',
  ...props 
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
