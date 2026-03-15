'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Loader from '@/components/common/Loader';
import PageTransition from '@/components/common/PageTransition';
import { shakeAnimation } from '@/lib/animations';

export default function CreateGatepass() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    enrollment_number: '',
    destination: '',
    reason: '',
    leave_time: '',
    expected_return_time: '',
    contact_number: '',
  });

  // Get current datetime in local format for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const toastId = toast.loading('Creating gatepass...');
    try {
      // Convert datetime-local format to ISO8601
      const submitData = {
        ...formData,
        leave_time: new Date(formData.leave_time).toISOString(),
        expected_return_time: new Date(formData.expected_return_time).toISOString(),
      };
      
      await api.post('/gatepass/create', submitData);
      toast.success('Gatepass created successfully!', { id: toastId });
      router.push('/student/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create gatepass';
      const errors = error.response?.data?.errors;
      
      if (errors && errors.length > 0) {
        const errorText = `Validation failed:\n${errors.map(e => `• ${e.msg}`).join('\n')}`;
        setError(errorText);
        toast.error('Please fix the validation errors', { id: toastId });
      } else {
        setError(errorMsg);
        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold mb-6 text-[var(--text-primary)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Create New Gatepass
        </motion.h1>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {error && (
            <motion.div 
              className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 whitespace-pre-line"
              animate={shakeAnimation}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="label label-required">Enrollment Number</label>
              <input
                type="text"
                name="enrollment_number"
                value={formData.enrollment_number}
                onChange={handleChange}
                className="input focus:scale-[1.01] transition-all duration-200"
                placeholder="e.g., EN2024001"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <label className="label label-required">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="input focus:scale-[1.01] transition-all duration-200"
                placeholder="e.g., Mumbai - Home"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="label label-required">Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="input focus:scale-[1.01] transition-all duration-200"
                rows="3"
                placeholder="Reason for leave"
                required
              />
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <div>
                <label className="label label-required">Leave Time</label>
                <input
                  type="datetime-local"
                  name="leave_time"
                  value={formData.leave_time}
                  onChange={handleChange}
                  className="input focus:scale-[1.01] transition-all duration-200"
                  min={minDateTime}
                  required
                />
              </div>

              <div>
                <label className="label label-required">Expected Return Time</label>
                <input
                  type="datetime-local"
                  name="expected_return_time"
                  value={formData.expected_return_time}
                  onChange={handleChange}
                  className="input focus:scale-[1.01] transition-all duration-200"
                  min={formData.leave_time || minDateTime}
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <label className="label label-required">Contact Number</label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="input focus:scale-[1.01] transition-all duration-200"
                placeholder="+1234567890 or 1234567890"
                required
              />
              <p className="helper-text">Enter at least 10 digits</p>
            </motion.div>

            <motion.div 
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <button
                type="submit"
                className="btn btn-primary inline-flex items-center"
                disabled={loading}
              >
                {loading && <Loader size="sm" />}
                {loading ? 'Creating...' : 'Submit Gatepass'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/student/dashboard')}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
