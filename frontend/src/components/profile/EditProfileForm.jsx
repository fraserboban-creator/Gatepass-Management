'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Save } from 'lucide-react';
import Modal from '@/components/common/Modal';
export default function EditProfileForm({ profile, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name:   profile.full_name   || '',
    phone:       profile.phone       || '',
    room_number: profile.room_number || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) { toast.error('Full name is required'); return; }
    setLoading(true);
    try {
      const response = await api.put('/profile', formData);
      toast.success('Profile updated successfully');
      onSuccess(response.data.data.profile);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-[var(--text-tertiary)]';

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Profile" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
            required className={inputClass} placeholder="Enter your full name" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
            className={inputClass} placeholder="Enter your phone number" />
        </motion.div>

        {profile.student_id && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Room Number</label>
            <input type="text" name="room_number" value={formData.room_number} onChange={handleChange}
              className={inputClass} placeholder="Enter your room number" />
          </motion.div>
        )}

        <motion.div className="flex gap-3 pt-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      </form>
    </Modal>
  );
}