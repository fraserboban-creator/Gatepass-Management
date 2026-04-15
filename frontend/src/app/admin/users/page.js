'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertTriangle size={20} className={danger ? 'text-red-600' : 'text-yellow-600'} />
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 btn text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'btn-primary'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}

const inputClass = 'input w-full border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-blue-500';

export default function UserManagement() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirm, setConfirm]       = useState(null); // { title, message, onConfirm, danger }
  const [formData, setFormData]     = useState({
    email: '', password: '', full_name: '', role: 'student',
    phone: '', student_id: '', hostel_block: '', room_number: '',
    parent_name: '', parent_email: '', parent_phone: '',
  });

  useEffect(() => { fetchUsers(); }, [filter]);

  const fetchUsers = async () => {
    try {
      const params = filter !== 'all' ? `?role=${filter}` : '';
      const response = await api.get(`/admin/users${params}`);
      setUsers(response.data.data.users || []);
    } catch { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email, password: '', full_name: user.full_name, role: user.role,
        phone: user.phone || '', student_id: user.student_id || '',
        hostel_block: user.hostel_block || '', room_number: user.room_number || '',
        parent_name: user.parent_name || '', parent_email: user.parent_email || '', parent_phone: user.parent_phone || '',
      });
    } else {
      setEditingUser(null);
      setFormData({ email: '', password: '', full_name: '', role: 'student', phone: '', student_id: '', hostel_block: '', room_number: '', parent_name: '', parent_email: '', parent_phone: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.patch(`/admin/users/${editingUser.id}`, updateData);
        toast.success('User updated successfully');
      } else {
        await api.post('/admin/users', formData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = (userId, userName) => {
    setConfirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${userId}`);
          toast.success('User deleted');
          fetchUsers();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete user');
        }
      },
    });
  };

  const handleToggleActive = (userId, isActive) => {
    const action = isActive ? 'deactivate' : 'activate';
    setConfirm({
      title: isActive ? 'Deactivate User' : 'Activate User',
      message: `Are you sure you want to ${action} this user?`,
      danger: isActive,
      onConfirm: async () => {
        try {
          await api.post(`/admin/users/${userId}/${action}`);
          toast.success(`User ${action}d successfully`);
          fetchUsers();
        } catch (error) {
          toast.error(error.response?.data?.message || `Failed to ${action} user`);
        }
      },
    });
  };

  if (loading) return <div className="text-[var(--text-primary)]">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">User Management</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">+ Add New User</button>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'student', 'coordinator', 'warden', 'security', 'admin'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {users.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-tertiary)]">
                  {['Name', 'Email', 'Role', 'Student ID', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}
                    className={`border-b border-[var(--border-primary)] transition-colors ${index % 2 === 0 ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'} hover:bg-[var(--surface-hover)]`}>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'       ? 'bg-purple-100 text-purple-800' :
                        user.role === 'warden'      ? 'bg-blue-100 text-blue-800' :
                        user.role === 'coordinator' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'security'    ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{user.student_id || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(user)}
                          className="w-9 h-9 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center text-sm" title="Edit">✏️</button>
                        <button onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`w-9 h-9 rounded-lg transition-colors flex items-center justify-center text-sm text-white ${user.is_active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}>
                          {user.is_active ? '🔒' : '🔓'}
                        </button>
                        <button onClick={() => handleDelete(user.id, user.full_name)}
                          className="w-9 h-9 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center text-sm" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingUser(null); }}
        title={editingUser ? 'Edit User' : 'Add New User'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Full Name *</label>
              <input type="text" className={inputClass} value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
            </div>
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Email *</label>
              <input type="email" className={inputClass} value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required disabled={!!editingUser} />
            </div>
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Password {!editingUser && '*'}</label>
              <input type="password" className={inputClass} value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser} placeholder={editingUser ? 'Leave blank to keep current' : ''} />
            </div>
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Role *</label>
              <select className={inputClass} value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                {['student', 'coordinator', 'warden', 'security', 'admin'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Phone</label>
              <input type="tel" className={inputClass} value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Student ID</label>
              <input type="text" className={inputClass} value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} />
            </div>
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Hostel Block</label>
              <input type="text" className={inputClass} value={formData.hostel_block}
                onChange={(e) => setFormData({ ...formData, hostel_block: e.target.value })} />
            </div>
            <div>
              <label className="label text-[var(--text-secondary)] font-medium">Room Number</label>
              <input type="text" className={inputClass} value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })} />
            </div>

            {formData.role === 'student' && (
              <>
                <div className="col-span-2 pt-2">
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Parent / Guardian Contact</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">Parents receive notifications when student exits or returns</p>
                </div>
                <div>
                  <label className="label text-[var(--text-secondary)] font-medium">Parent Name</label>
                  <input type="text" className={inputClass} value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })} placeholder="Mr. John Doe" />
                </div>
                <div>
                  <label className="label text-[var(--text-secondary)] font-medium">Parent Email</label>
                  <input type="email" className={inputClass} value={formData.parent_email}
                    onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })} placeholder="parent@example.com" />
                </div>
                <div>
                  <label className="label text-[var(--text-secondary)] font-medium">Parent Phone</label>
                  <input type="tel" className={inputClass} value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })} placeholder="+1234567890" />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" className="btn btn-primary flex-1">
              {editingUser ? 'Update User' : 'Create User'}
            </button>
            <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }}
              className="btn btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          isOpen={!!confirm}
          onClose={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
          title={confirm.title}
          message={confirm.message}
          danger={confirm.danger}
        />
      )}
    </div>
  );
}
