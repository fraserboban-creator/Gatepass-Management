'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService } from '@/lib/auth';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { FileText, Clock, CheckCircle, XCircle, Eye, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const DEPT = 'AI & Machine Learning';

// ── Mock hostel students (AI&ML only) ─────────────────────────────────────
const AIML_STUDENTS = [
  { id: 1,  name: 'Rahul Sharma',   roll: 'AIML2021001', room: 'A-101', phone: '9876543210' },
  { id: 2,  name: 'Priya Patel',    roll: 'AIML2021002', room: 'A-102', phone: '9876543211' },
  { id: 3,  name: 'Amit Kumar',     roll: 'AIML2021003', room: 'B-201', phone: '9876543212' },
  { id: 4,  name: 'Sneha Reddy',    roll: 'AIML2021004', room: 'B-202', phone: '9876543213' },
  { id: 5,  name: 'Vikram Singh',   roll: 'AIML2021005', room: 'C-301', phone: '9876543214' },
  { id: 6,  name: 'Anjali Mehta',   roll: 'AIML2021006', room: 'C-302', phone: '9876543215' },
  { id: 7,  name: 'Rohan Das',      roll: 'AIML2021007', room: 'D-401', phone: '9876543216' },
  { id: 8,  name: 'Kavya Nair',     roll: 'AIML2021008', room: 'D-402', phone: '9876543217' },
];

// ── Mock gatepasses — only 3+ day leaves need HOD approval ────────────────
// leave_days >= 3 → needs HOD approval (hod_status: 'pending' | 'approved' | 'rejected')
// leave_days < 3  → hod_status: null (no HOD approval needed)
const MOCK_GATEPASSES = [
  {
    id: 1, student_id: 1, student_name: 'Rahul Sharma', student_roll: 'AIML2021001',
    destination: 'Home - Mumbai', reason: 'Family function',
    leave_time: '2026-03-18T08:00:00', return_time: '2026-03-22T20:00:00',
    leave_days: 4, status: 'coordinator_approved', hod_status: 'pending',
  },
  {
    id: 2, student_id: 2, student_name: 'Priya Patel', student_roll: 'AIML2021002',
    destination: 'Hospital', reason: 'Medical checkup',
    leave_time: '2026-03-17T09:00:00', return_time: '2026-03-17T18:00:00',
    leave_days: 1, status: 'approved', hod_status: null,
  },
  {
    id: 3, student_id: 4, student_name: 'Sneha Reddy', student_roll: 'AIML2021004',
    destination: 'Home - Hyderabad', reason: 'Festival holidays',
    leave_time: '2026-03-20T07:00:00', return_time: '2026-03-25T21:00:00',
    leave_days: 5, status: 'coordinator_approved', hod_status: 'pending',
  },
  {
    id: 4, student_id: 5, student_name: 'Vikram Singh', student_roll: 'AIML2021005',
    destination: 'City', reason: 'Personal work',
    leave_time: '2026-03-17T11:00:00', return_time: '2026-03-17T19:00:00',
    leave_days: 1, status: 'pending', hod_status: null,
  },
  {
    id: 5, student_id: 7, student_name: 'Rohan Das', student_roll: 'AIML2021007',
    destination: 'Home - Kolkata', reason: 'Semester break visit',
    leave_time: '2026-03-19T06:00:00', return_time: '2026-03-25T22:00:00',
    leave_days: 6, status: 'coordinator_approved', hod_status: 'approved',
  },
  {
    id: 6, student_id: 8, student_name: 'Kavya Nair', student_roll: 'AIML2021008',
    destination: 'Home - Kerala', reason: 'Health issue',
    leave_time: '2026-03-16T08:00:00', return_time: '2026-03-19T20:00:00',
    leave_days: 3, status: 'coordinator_approved', hod_status: 'rejected',
  },
];

const STATUSES = ['all', 'pending', 'approved', 'rejected'];

// Helper — how many days between two ISO datetime strings
function calcDays(leave, ret) {
  if (!leave || !ret) return 0;
  return Math.round((new Date(ret) - new Date(leave)) / (1000 * 60 * 60 * 24));
}

export default function HODDashboard() {
  const [loading, setLoading] = useState(true);
  const [gatepasses, setGatepasses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'students' | 'all'

  useEffect(() => {
    setTimeout(() => { setGatepasses(MOCK_GATEPASSES); setLoading(false); }, 500);
  }, []);

  // Only 3+ day leaves that need HOD approval
  const pendingHOD = gatepasses.filter(g => g.leave_days >= 3 && g.hod_status === 'pending');

  const stats = {
    total:    gatepasses.length,
    approved: gatepasses.filter(g => g.hod_status === 'approved' || (g.hod_status === null && g.status === 'approved')).length,
    pending:  pendingHOD.length,
    longLeave: gatepasses.filter(g => g.leave_days >= 3).length,
  };

  const handleHODAction = (id, action) => {
    setGatepasses(prev => prev.map(g =>
      g.id === id ? { ...g, hod_status: action, status: action === 'approved' ? 'approved' : 'rejected' } : g
    ));
    toast.success(`Gatepass ${action === 'approved' ? 'approved' : 'rejected'} by HOD`);
    setDetailModal(null);
  };

  // Filtered list for "All Gatepasses" tab
  const filtered = gatepasses.filter(g => {
    const matchStatus = filterStatus === 'all' || g.status === filterStatus || g.hod_status === filterStatus;
    const matchDate = !filterDate || g.leave_time.startsWith(filterDate);
    return matchStatus && matchDate;
  });

  if (loading) return <LoadingState fullScreen text="Loading HOD Dashboard..." />;

  return (
    <PageTransition>
      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">HOD Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Department: {DEPT}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Gatepasses"   value={stats.total}     icon={FileText}     color="blue"   delay={0}   />
        <DashboardCard title="Approved"            value={stats.approved}  icon={CheckCircle}  color="green"  delay={0.1} />
        <DashboardCard title="Awaiting HOD"        value={stats.pending}   icon={Clock}        color="yellow" delay={0.2} />
        <DashboardCard title="Long Leaves (3+ d)"  value={stats.longLeave} icon={AlertTriangle} color="red"   delay={0.3} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border-primary)]">
        {[
          { key: 'approvals', label: 'HOD Approvals', count: pendingHOD.length },
          { key: 'students',  label: 'Hostel Students', count: AIML_STUDENTS.length },
          { key: 'all',       label: 'All Gatepasses',  count: gatepasses.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}>
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: HOD Approvals (3+ day leaves only) ── */}
      {activeTab === 'approvals' && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-yellow-600" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Pending HOD Approval</h2>
            <span className="text-xs text-gray-500 ml-1">(Only leaves of 3 or more days require HOD approval)</span>
          </div>

          {pendingHOD.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No pending approvals</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Destination</th>
                    <th>Reason</th>
                    <th>Leave Date</th>
                    <th>Return Date</th>
                    <th>Days</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {pendingHOD.map(g => (
                    <motion.tr key={g.id} variants={listItemVariants}>
                      <td>
                        <p className="font-medium">{g.student_name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{g.student_roll}</p>
                      </td>
                      <td>{g.destination}</td>
                      <td className="max-w-[160px] truncate">{g.reason}</td>
                      <td>{formatDateTime(g.leave_time)}</td>
                      <td>{formatDateTime(g.return_time)}</td>
                      <td>
                        <span className="badge badge-warning font-semibold">{g.leave_days}d</span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleHODAction(g.id, 'approved')}
                            className="btn btn-sm btn-primary">Approve</button>
                          <button onClick={() => handleHODAction(g.id, 'rejected')}
                            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white">Reject</button>
                          <button onClick={() => setDetailModal(g)}
                            className="btn btn-sm btn-secondary" title="View Details">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ── TAB: Hostel Students (AI&ML) ── */}
      {activeTab === 'students' && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">AI & ML Hostel Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Gatepass Status</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {AIML_STUDENTS.map((s, i) => {
                  const latest = gatepasses.filter(g => g.student_id === s.id).slice(-1)[0];
                  return (
                    <motion.tr key={s.id} variants={listItemVariants}>
                      <td className="text-[var(--text-secondary)]">{i + 1}</td>
                      <td className="font-medium">{s.name}</td>
                      <td>{s.roll}</td>
                      <td>{s.room}</td>
                      <td>{s.phone}</td>
                      <td>
                        {latest ? (
                          <div>
                            <span className={`badge ${getStatusBadgeClass(latest.hod_status || latest.status)}`}>
                              {latest.hod_status
                                ? `HOD: ${latest.hod_status.charAt(0).toUpperCase() + latest.hod_status.slice(1)}`
                                : getStatusLabel(latest.status)}
                            </span>
                            {latest.leave_days >= 3 && (
                              <span className="badge badge-warning ml-1 text-xs">{latest.leave_days}d leave</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[var(--text-tertiary)] text-sm">No gatepass</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── TAB: All Gatepasses ── */}
      {activeTab === 'all' && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">All Gatepasses — {DEPT}</h2>
            <div className="flex gap-2">
              <select className="input text-sm py-1.5 w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <input type="date" className="input text-sm py-1.5 w-auto" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="text-[var(--text-tertiary)] text-center py-8">No gatepasses found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th><th>Student</th><th>Destination</th><th>Leave</th><th>Days</th><th>Status</th><th>HOD</th><th></th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {filtered.map(g => (
                    <motion.tr key={g.id} variants={listItemVariants}>
                      <td>#{g.id}</td>
                      <td>
                        <p className="font-medium">{g.student_name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{g.student_roll}</p>
                      </td>
                      <td>{g.destination}</td>
                      <td>{formatDateTime(g.leave_time)}</td>
                      <td><span className={`badge ${g.leave_days >= 3 ? 'badge-warning' : 'badge-success'}`}>{g.leave_days}d</span></td>
                      <td><span className={`badge ${getStatusBadgeClass(g.status)}`}>{getStatusLabel(g.status)}</span></td>
                      <td>
                        {g.hod_status ? (
                          <span className={`badge ${g.hod_status === 'approved' ? 'badge-success' : g.hod_status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                            {g.hod_status.charAt(0).toUpperCase() + g.hod_status.slice(1)}
                          </span>
                        ) : <span className="text-xs text-[var(--text-tertiary)]">N/A</span>}
                      </td>
                      <td>
                        <button onClick={() => setDetailModal(g)} className="btn btn-sm btn-secondary"><Eye size={16} /></button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Gatepass Details" maxWidth="max-w-md">
          <div className="p-6 space-y-3 text-sm">
            {[
              ['Student',     detailModal.student_name],
              ['Roll No',     detailModal.student_roll],
              ['Department',  DEPT],
              ['Destination', detailModal.destination],
              ['Reason',      detailModal.reason],
              ['Leave Date',  formatDateTime(detailModal.leave_time)],
              ['Return Date', formatDateTime(detailModal.return_time)],
              ['Duration',    `${detailModal.leave_days} day(s)`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className="font-medium text-[var(--text-primary)]">{val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Status</span>
              <span className={`badge ${getStatusBadgeClass(detailModal.status)}`}>{getStatusLabel(detailModal.status)}</span>
            </div>
            {detailModal.hod_status && (
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">HOD Decision</span>
                <span className={`badge ${detailModal.hod_status === 'approved' ? 'badge-success' : detailModal.hod_status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{detailModal.hod_status.charAt(0).toUpperCase() + detailModal.hod_status.slice(1)}</span>
              </div>
            )}
            {detailModal.hod_status === 'pending' ? (
              <div className="flex gap-3 pt-3">
                <button onClick={() => handleHODAction(detailModal.id, 'approved')} className="btn btn-primary flex-1">Approve</button>
                <button onClick={() => handleHODAction(detailModal.id, 'rejected')} className="btn flex-1 bg-red-600 hover:bg-red-700 text-white">Reject</button>
              </div>
            ) : (
              <button onClick={() => setDetailModal(null)} className="btn btn-primary w-full mt-3">Close</button>
            )}
          </div>
        </Modal>
      )}
    </PageTransition>
  );
}
