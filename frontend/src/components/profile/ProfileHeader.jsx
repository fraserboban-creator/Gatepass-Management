'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ID, Home, Building2 } from 'lucide-react';

export default function ProfileHeader({ profile, onEditClick }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      security: 'bg-green-100 text-green-800',
      coordinator: 'bg-purple-100 text-purple-800',
      warden: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {profile.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile.full_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200">
              {getInitials(profile.full_name)}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                {profile.full_name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(profile.role)}`}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
                <span className="text-[var(--text-secondary)] text-sm">
                  {profile.email}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={onEditClick}
              className="btn btn-primary whitespace-nowrap"
            >
              Edit Profile
            </button>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Phone</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{profile.phone}</p>
                </div>
              </div>
            )}

            {profile.student_id && (
              <div className="flex items-center gap-3">
                <ID size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Student ID</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{profile.student_id}</p>
                </div>
              </div>
            )}

            {profile.room_number && (
              <div className="flex items-center gap-3">
                <Home size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Room Number</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{profile.room_number}</p>
                </div>
              </div>
            )}

            {profile.hostel_block && (
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Hostel Block</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{profile.hostel_block}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
