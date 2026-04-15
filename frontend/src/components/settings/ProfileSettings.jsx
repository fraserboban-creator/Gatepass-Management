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
    parent_phone: '',
    parent_notification_enabled: true,
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    // Demo accounts (HOD/OS) use a fake token — skip the API call entirely
    // to avoid the 401 interceptor wiping localStorage and redirecting to login
    const token = localStorage.getItem('token') || '';
    const isDemoAccount = token.endsWith('.demo');

    if (isDemoAccount) {
      try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        if (stored) {
          setProfile(stored);
          setFormData({
            full_name: stored.full_name || '',
            phone: stored.phone || '',
            room_number: stored.room_number || '',
            parent_name: stored.parent_name || '',
            parent_email: stored.parent_email || '',
            parent_phone: stored.parent_phone || '',
            parent_notification_enabled: stored.parent_notification_enabled !== false,
          });
        } else {
          toast.error('Failed to load profile');
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
      return;
    }

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
        parent_phone: userData.parent_phone || '',
        parent_notification_enabled: userData.parent_notification_enabled !== false,
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

    const token = localStorage.getItem('token') || '';
    const isDemoAccount = token.endsWith('.demo');

    if (isDemoAccount) {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, ...formData };
      localStorage.setItem('user', JSON.stringify(updated));
      setProfile(updated);
      toast.success('Profile updated successfully');
      setSaving(false);
      return;
    }

    try {
      await api.put('/profile', formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card"><p className="text-center py-8 text-[var(--text-secondary)]">Loading profile...</p></div>;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            <User className="inline mr-2" size={16} />Full Name
          </label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Mail className="inline mr-2" size={16} />Email
          </label>
          <input type="email" value={profile?.email || ''} className="input opacity-60 cursor-not-allowed" disabled />
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Phone className="inline mr-2" size={16} />Phone Number
          </label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" placeholder="+1234567890" />
        </div>

        {profile?.role === 'student' && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              <Home className="inline mr-2" size={16} />Room Number
            </label>
            <input type="text" name="room_number" value={formData.room_number} onChange={handleChange} className="input" placeholder="A-101" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Briefcase className="inline mr-2" size={16} />Role
          </label>
          <input type="text" value={profile?.role?.toUpperCase() || ''} className="input opacity-60 cursor-not-allowed" disabled />
        </div>

        {/* Parent Info — students only */}
        {profile?.role === 'student' && (
          <div className="border-t border-[var(--border-primary)] pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Parent / Guardian Information</h3>
              </div>
              {/* Email notification toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-sm text-[var(--text-secondary)]">Email Alerts</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer"
                    checked={!!formData.parent_notification_enabled}
                    onChange={e => setFormData({ ...formData, parent_notification_enabled: e.target.checked })} />
                  <div className="w-11 h-6 bg-[var(--border-primary)] rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </div>
              </label>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Add your parent's contact details to enable automatic email notifications when your gatepass is created, approved, or when you exit/return.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Parent Name</label>
                <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} className="input" placeholder="Parent / Guardian full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Parent Email</label>
                <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} className="input" placeholder="parent@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Parent Phone</label>
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
