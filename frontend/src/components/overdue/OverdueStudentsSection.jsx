'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import PageTransition from '@/components/common/PageTransition';

export default function OverdueStudentsSection({ userRole = 'security' }) {
  const [overdueGatepasses, setOverdueGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverdueGatepasses();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchOverdueGatepasses, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOverdueGatepasses = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await api.get('/overdue/my-overdue');
      
      // Check if response has the expected structure
      if (!response.data || !response.data.data) {
        throw new Error('No data returned in response');
      }
      
      setOverdueGatepasses(response.data.data.overdueGatepasses || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch overdue gatepasses:', error);
      console.error('Error response:', error.response);
      setOverdueGatepasses([]);
      
      // Better error message
      let errorMessage = 'Failed to load overdue students';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setError(null);
    await fetchOverdueGatepasses();
    if (!error) {
      toast.success('Overdue list refreshed');
    }
  };

  if (loading) {
    return (
      <motion.div
        className="card bg-blue-50 border border-blue-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-blue-900">Overdue Students</h2>
        </div>
        <p className="text-blue-700">Loading overdue students...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="card bg-red-50 border border-red-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-red-900">Overdue Students</h2>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </motion.div>
    );
  }

  if (overdueGatepasses.length === 0) {
    return (
      <motion.div
        className="card bg-green-50 border border-green-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold text-green-900">Overdue Students</h2>
        </div>
        <p className="text-green-700">✓ No overdue students at the moment</p>
      </motion.div>
    );
  }

  return (
    <PageTransition>
      <motion.div
        className="card bg-red-50 border border-red-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-red-900">Overdue Students</h2>
              <p className="text-sm text-red-700">{overdueGatepasses.length} student{overdueGatepasses.length !== 1 ? 's' : ''} not returned</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-red-100 border-b border-red-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Student ID</th>
                {userRole === 'security' && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Room Number</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Destination</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Return Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Overdue Duration</th>
              </tr>
            </thead>
            <tbody>
              {overdueGatepasses.map((gatepass, index) => (
                <motion.tr
                  key={gatepass.id}
                  className={`border-b border-red-200 ${
                    index % 2 === 0 ? 'bg-red-50' : 'bg-white'
                  } hover:bg-red-100 transition-colors duration-200`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-red-900">
                    {gatepass.student_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-800">
                    {gatepass.student_roll}
                  </td>
                  {userRole === 'security' && (
                    <td className="px-4 py-3 text-sm text-red-800">
                      {gatepass.room_number || '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-red-800">
                    {gatepass.destination}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-800">
                    {new Date(gatepass.expected_return_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {gatepass.overdue_duration}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
          <strong>⚠️ Alert:</strong> These students have exceeded their expected return time. Immediate action may be required.
        </div>
      </motion.div>
    </PageTransition>
  );
}
