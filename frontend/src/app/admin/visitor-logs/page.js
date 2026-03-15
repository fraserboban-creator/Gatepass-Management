'use client';

import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import VisitorStats from '@/components/visitor/VisitorStats';
import VisitorLogs from '@/components/visitor/VisitorLogs';
import { BarChart3 } from 'lucide-react';

export default function VisitorLogsPage() {
  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-purple-600" size={32} />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Visitor Logs & Analytics</h1>
        </div>
        <p className="text-[var(--text-secondary)]">View all visitor activity and statistics</p>
      </motion.div>

      <div className="space-y-8">
        <VisitorStats />
        <VisitorLogs />
      </div>
    </PageTransition>
  );
}
