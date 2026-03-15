'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    phone: '',
    student_id: '',
    hostel_block: '',
    room_number: '',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const params = filter !== 'all' ? `?role=${filter}` : '';
      const response = await api.get(`/admin/users${params}`);
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        full_name: user.full_name,
        role: user.role,
        phone: user.phone || '',
        student_id: user.student_id || '',
        hostel_block: user.hostel_block || '',
        room_number: user.room_number || '',
        parent_name: user.parent_name || '',
        parent_email: user.parent_email || '',
        parent_phone: user.parent_phone || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'student',
        phone: '',
        student_id: '',
        hostel_block: '',
        room_number: '',
        parent_name: '',
        parent_email: '',
        parent_phone: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await api.patch(`/admin/users/${editingUser.id}`, updateData);
        alert('User updated successfully!');
      } else {
        // Create user
        await api.post('/admin/users', formData);
        alert('User created successfully!');
      }
      
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await api.post(`/admin/users/${userId}/deactivate`);
      } else {
        await api.post(`/admin/users/${userId}/activate`);
      }
      alert(`User ${!isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) return <div className="dark:text-white">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900">User Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          + Add New User
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('student')}
            className={`btn ${filter === 'student' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Students
          </button>
          <button
            onClick={() => setFilter('coordinator')}
            className={`btn ${filter === 'coordinator' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Coordinators
          </button>
          <button
            onClick={() => setFilter('warden')}
            className={`btn ${filter === 'warden' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Wardens
          </button>
          <button
            onClick={() => setFilter('security')}
            className={`btn ${filter === 'security' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Security
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`btn ${filter === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Admins
          </button>
        </div>
      </div>

      <div className="card">
        {users.length === 0 ? (
          <p className="text-blue-400 text-center py-8">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-slate-200 transition-colors duration-200 cursor-pointer ${
                      index % 2 === 0 
                        ? 'bg-slate-50 hover:bg-blue-100' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'warden' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'coordinator' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'security' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{user.student_id || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.is_active 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 font-medium text-sm"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 font-medium text-sm text-white ${
                            user.is_active 
                              ? 'bg-amber-500 hover:bg-amber-600' 
                              : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 font-medium text-sm"
                          title="Delete"
                        >
                          🗑️
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
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-blue-200">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-blue-700 font-medium">Full Name *</label>
                  <input
                    type="text"
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label text-blue-700 font-medium">Email *</label>
                  <input
                    type="email"
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                </div>

                <div>
                  <label className="label text-blue-700 font-medium">Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current' : ''}
                  />
                </div>

                <div>
                  <label className="label text-blue-700 font-medium">Role *</label>
                  <select
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="warden">Warden</option>
                    <option value="security">Security</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="label text-blue-700 font-medium">Phone</label>
                  <input
                    type="tel"
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-blue-700 font-medium">Student ID</label>
                  <input
                    type="text"
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-blue-700 font-medium">Hostel Block</label>
                  <input
                    type="text"
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.hostel_block}
                    onChange={(e) => setFormData({ ...formData, hostel_block: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-blue-700 font-medium">Room Number</label>
                  <input
                    type="text"
                    className="input w-full border-blue-200 focus:ring-blue-400"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  />
                </div>

                {/* Parent Contact Information */}
                {formData.role === 'student' && (
                  <>
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-900">Parent/Guardian Contact Information</h3>
                      <p className="text-sm text-blue-600 mb-4">
                        Parents will receive email/SMS notifications when student exits or returns to hostel
                      </p>
                    </div>

                    <div>
                      <label className="label text-blue-700 font-medium">Parent/Guardian Name</label>
                      <input
                        type="text"
                        className="input w-full border-blue-200 focus:ring-blue-400"
                        value={formData.parent_name}
                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        placeholder="e.g., Mr. John Doe"
                      />
                    </div>

                    <div>
                      <label className="label text-blue-700 font-medium">Parent Email</label>
                      <input
                        type="email"
                        className="input w-full border-blue-200 focus:ring-blue-400"
                        value={formData.parent_email}
                        onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                        placeholder="parent@example.com"
                      />
                    </div>

                    <div>
                      <label className="label text-blue-700 font-medium">Parent Phone</label>
                      <input
                        type="tel"
                        className="input w-full border-blue-200 focus:ring-blue-400"
                        value={formData.parent_phone}
                        onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
