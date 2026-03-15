'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import WalkInVisitorForm from '@/components/visitor/WalkInVisitorForm';
import VisitorStats from '@/components/visitor/VisitorStats';
import VisitorLogs from '@/components/visitor/VisitorLogs';
import { UserPlus } from 'lucide-react';

export default function WalkInVisitorsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePassCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <UserPlus className="text-green-600" size={32} />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Walk-in Visitors</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Manage unexpected visitor arrivals</p>
      </motion.div>

      <div className="space-y-8">
        <VisitorStats key={refreshKey} />
        <WalkInVisitorForm onSuccess={handlePassCreated} />
        <VisitorLogs key={refreshKey} />
      </div>
    </PageTransition>
  );
}
