'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Info, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function AccountInformation() {
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    try {
      const response = await api.get('/profile/account-info');
      setAccountInfo(response.data.data.accountInfo);
    } catch (error) {
      toast.error('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <p className="text-center py-8 text-[var(--text-tertiary)]">Loading account information...</p>
      </motion.div>
    );
  }

  if (!accountInfo) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Info className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Account Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-blue-600" size={20} />
            <p className="text-sm font-medium text-[var(--text-secondary)]">Account Status</p>
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {accountInfo.account_status}
          </p>
        </div>

        {/* Account Created */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-green-600" size={20} />
            <p className="text-sm font-medium text-[var(--text-secondary)]">Account Created</p>
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {accountInfo.account_age}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {formatDate(accountInfo.created_at)}
          </p>
        </div>

        {/* Last Updated */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-purple-600" size={20} />
            <p className="text-sm font-medium text-[var(--text-secondary)]">Last Updated</p>
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {formatDate(accountInfo.updated_at)}
          </p>
        </div>

        {/* User ID */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <Info className="text-orange-600" size={20} />
            <p className="text-sm font-medium text-[var(--text-secondary)]">User ID</p>
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)] font-mono">
            #{accountInfo.id}
          </p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Additional Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Email</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{accountInfo.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Role</span>
            <span className="text-sm font-medium text-[var(--text-primary)] capitalize">
              {accountInfo.role}
            </span>
          </div>
          {accountInfo.student_id && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Student ID</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{accountInfo.student_id}</span>
            </div>
          )}
          {accountInfo.phone && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Phone</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{accountInfo.phone}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
