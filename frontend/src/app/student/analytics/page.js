'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService } from '@/lib/auth';
import PageTransition from '@/components/common/PageTransition';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function StudentAnalytics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  if (!user) {
    return null;
  }

  return (
    <PageTransition>
      <motion.h1
        className="text-3xl font-bold mb-6 text-[var(--text-primary)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        My Analytics
      </motion.h1>

      <AnalyticsDashboard role="student" studentId={user.id} />
    </PageTransition>
  );
}
