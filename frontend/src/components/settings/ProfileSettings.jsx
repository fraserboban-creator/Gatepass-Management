'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { User, Mail, Phone, Home, Briefcase, Save, Users } from 'lucide-react';

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    room_number: '',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const userData = response.data.data.profile || response.data.data.user;
      setProfile(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        room_number: userData.room_number || '',
        parent_name: userData.parent_name || '',
        parent_email: userData.parent_email || '',
        parent_phone: userData.parent_phone || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card"><p className="text-center py-8 text-gray-600">Loading profile...</p></div>;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline mr-2" size={16} />Full Name
          </label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline mr-2" size={16} />Email
          </label>
          <input type="email" value={profile?.email || ''} className="input bg-gray-100" disabled />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline mr-2" size={16} />Phone Number
          </label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" placeholder="+1234567890" />
        </div>

        {profile?.role === 'student' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="inline mr-2" size={16} />Room Number
            </label>
            <input type="text" name="room_number" value={formData.room_number} onChange={handleChange} className="input" placeholder="A-101" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="inline mr-2" size={16} />Role
          </label>
          <input type="text" value={profile?.role?.toUpperCase() || ''} className="input bg-gray-100" disabled />
        </div>

        {/* Parent Info — students only */}
        {profile?.role === 'student' && (
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Parent / Guardian Information</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Add your parent's contact details to enable automatic email notifications when you exit or return to the hostel.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Name</label>
                <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} className="input" placeholder="Parent / Guardian full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} className="input" placeholder="parent@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleChange} className="input" placeholder="+1234567890" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
