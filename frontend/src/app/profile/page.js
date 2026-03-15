'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import PageTransition from '@/components/common/PageTransition';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EditProfileForm from '@/components/profile/EditProfileForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import AccountInformation from '@/components/profile/AccountInformation';
import { User, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setError(null);
      const response = await api.get('/profile');
      setProfile(response.data.data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile. Please try again.');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading your profile...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <motion.div
          className="card border-l-4 border-red-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-semibold text-red-600 mb-1">Error Loading Profile</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchProfile}
            className="mt-4 btn btn-primary"
          >
            Try Again
          </button>
        </motion.div>
      </PageTransition>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <PageTransition>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <User className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Profile</h1>
        </div>
        <p className="text-[var(--text-secondary)]">View and manage your profile information</p>
      </motion.div>

      {/* Profile Header */}
      <div className="mb-8">
        <ProfileHeader
          profile={profile}
          onEditClick={() => setShowEditModal(true)}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Change Password */}
        <ChangePasswordForm />

        {/* Account Information */}
        <AccountInformation />
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileForm
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleProfileUpdate}
        />
      )}
    </PageTransition>
  );
}
