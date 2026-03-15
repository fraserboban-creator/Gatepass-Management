'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import CreateVisitorPassForm from '@/components/visitor/CreateVisitorPassForm';
import VisitorPassesList from '@/components/visitor/VisitorPassesList';
import { Users } from 'lucide-react';

export default function StudentVisitorPassPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const formRef = useRef(null);

  const handlePassCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateClick = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          <Users className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Visitor Pass Management</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Create and manage visitor passes for your guests</p>
      </motion.div>

      <div className="space-y-8">
        <div ref={formRef}>
          <CreateVisitorPassForm onSuccess={handlePassCreated} />
        </div>
        <VisitorPassesList key={refreshKey} onCreateClick={handleCreateClick} />
      </div>
    </PageTransition>
  );
}
