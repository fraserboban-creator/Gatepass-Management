'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import NotificationBell from '@/components/notifications/NotificationBell';
import GlobalSearchBar from '@/components/search/GlobalSearchBar';
import { Menu, X, Settings } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  if (!user) return null;

  const handleViewFullProfile = () => {
    setShowProfileModal(false);
    router.push('/profile');
  };

  return (
    <>
      <div className="bg-white border-b border-blue-200 px-4 sm:px-6 py-4 shadow-sm">
        {/* Top Row - User Info and Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900">
                Welcome, {user.full_name}!
              </h2>
              <p className="text-xs sm:text-sm text-blue-600 capitalize">{user.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationBell />

            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <div className="text-right">
                <p className="font-medium text-blue-900">{user.full_name}</p>
                <p className="text-xs text-blue-600">View Profile</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Row - Global Search */}
        <div className="flex justify-center">
          <GlobalSearchBar placeholder="Search gatepasses, users, logs..." />
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-blue-200 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">My Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-blue-400 hover:text-blue-600 text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-md">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Full Name</label>
                <p className="text-lg font-semibold text-blue-900">{user.full_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Email</label>
                <p className="text-lg text-blue-800">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Role</label>
                <span className="badge badge-primary capitalize">{user.role}</span>
              </div>

              {user.student_id && (
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1">Student ID</label>
                  <p className="text-lg text-blue-800">{user.student_id}</p>
                </div>
              )}

              {user.phone && (
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1">Phone</label>
                  <p className="text-lg text-blue-800">{user.phone}</p>
                </div>
              )}

              {user.hostel_block && (
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1">Hostel Block</label>
                  <p className="text-lg text-blue-800">{user.hostel_block}</p>
                </div>
              )}

              {user.room_number && (
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1">Room Number</label>
                  <p className="text-lg text-blue-800">{user.room_number}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Account Status</label>
                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleViewFullProfile}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Settings size={18} />
                View Full Profile
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="btn btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
