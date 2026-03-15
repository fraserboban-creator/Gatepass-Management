'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { RefreshCw, Eye, Plus } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import VisitorPassDetailModal from './VisitorPassDetailModal';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  active: 'bg-blue-100 text-blue-800 border-blue-300',
  exited: 'bg-gray-100 text-gray-800 border-gray-300',
  overdue: 'bg-red-100 text-red-800 border-red-300'
};

export default function VisitorPassesList({ onCreateClick }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPassId, setSelectedPassId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await api.get('/visitor-pass/my-passes');
      
      // Check if response is successful
      if (response.data && response.data.success) {
        setPasses(response.data.data.passes || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch visitor passes:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load visitor passes. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewPass = (passId) => {
    setSelectedPassId(passId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPassId(null);
  };

  if (loading) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-center py-8 text-[var(--text-tertiary)]">Loading visitor passes...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="card border-l-4 border-red-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-red-600 mb-1">Unable to Load Visitor Passes</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button
            onClick={fetchPasses}
            disabled={refreshing}
            className="btn btn-sm btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">My Visitor Passes</h2>
        <button
          onClick={fetchPasses}
          disabled={refreshing}
          className="btn btn-sm btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {passes.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-4">
            <Plus size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No Visitor Passes Yet
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Create your first visitor pass to invite guests to the hostel.
            </p>
            {onCreateClick && (
              <button
                onClick={onCreateClick}
                className="btn btn-primary"
              >
                + Create Visitor Pass
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 border-b border-blue-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Visitor Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Expected Exit</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passes.map((pass, index) => (
                <motion.tr
                  key={pass.id}
                  className={`border-b border-blue-100 ${
                    index % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-blue-100 transition-colors duration-200`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                    {pass.visitor_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {pass.visitor_phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {pass.purpose.substring(0, 30)}{pass.purpose.length > 30 ? '...' : ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {formatDateTime(pass.expected_exit_time)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[pass.status] || statusColors.pending}`}>
                      {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewPass(pass.id)}
                      className="btn btn-sm btn-secondary flex items-center gap-2"
                      title="View Details"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <VisitorPassDetailModal
        isOpen={showModal}
        onClose={handleCloseModal}
        passId={selectedPassId}
      />
    </motion.div>
  );
}
