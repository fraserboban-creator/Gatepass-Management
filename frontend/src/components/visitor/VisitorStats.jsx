'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import DashboardCard from '@/components/common/DashboardCard';
import { Users, LogIn, LogOut, AlertTriangle } from 'lucide-react';

export default function VisitorStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    exited: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/visitor-pass/stats/today');
      const data = response.data.data.stats;
      setStats({
        total: data.total || 0,
        active: data.active || 0,
        exited: data.exited || 0,
        overdue: data.overdue || 0
      });
    } catch (error) {
      console.error('Failed to fetch visitor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card h-32 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <DashboardCard
          title="Today's Visitors"
          value={stats.total}
          icon={Users}
          color="blue"
          delay={0}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DashboardCard
          title="Active Visitors"
          value={stats.active}
          icon={LogIn}
          color="green"
          delay={0.1}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DashboardCard
          title="Visitors Left"
          value={stats.exited}
          icon={LogOut}
          color="gray"
          delay={0.2}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DashboardCard
          title="Overdue Visitors"
          value={stats.overdue}
          icon={AlertTriangle}
          color="red"
          delay={0.3}
        />
      </motion.div>
    </div>
  );
}
