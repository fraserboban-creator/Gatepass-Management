'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService } from '@/lib/auth';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { LogOut, LogIn, Users, AlertTriangle, Download } from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_LOGS = [
  { id: 1, student_name: 'Priya Patel', student_roll: 'EC2021045', department: 'Electronics', destination: 'Hospital', exit_time: '2026-03-17T09:00:00', return_time: '2026-03-17T13:30:00', status: 'returned' },
  { id: 2, student_name: 'Rahul Sharma', student_roll: 'CS2021001', department: 'Computer Science', destination: 'Home', exit_time: '2026-03-17T10:00:00', return_time: null, status: 'outside' },
  { id: 3, student_name: 'Vikram Singh', student_roll: 'CE2021011', department: 'Civil', destination: 'Market', exit_time: '2026-03-17T11:00:00', return_time: null, status: 'outside' },
  { id: 4, student_name: 'Sneha Reddy', student_roll: 'CS2021078', department: 'Computer Science', destination: 'Home', exit_time: '2026-03-15T08:00:00', return_time: null, status: 'overdue' },
  { id: 5, student_name: 'Anjali Mehta', student_roll: 'EC2021067', department: 'Electronics', destination: 'Home', exit_time: '2026-03-14T07:00:00', return_time: null, status: 'overdue' },
  { id: 6, student_name: 'Amit Kumar', student_roll: 'ME2021032', department: 'Mechanical', destination: 'City', exit_time: '2026-03-16T14:00:00', return_time: '2026-03-16T20:00:00', status: 'returned' },
];

const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil'];

export default function OSDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  useEffect(() => {
    setUser(authService.getUser());
    setTimeout(() => {
      setLogs(MOCK_LOGS);
      setLoading(false);
    }, 600);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const stats = {
    exitsToday: logs.filter(l => l.exit_time?.startsWith(today)).length,
    returnsToday: logs.filter(l => l.return_time?.startsWith(today)).length,
    outside: logs.filter(l => l.status === 'outside').length,
    overdue: logs.filter(l => l.status === 'overdue').length,
  };

  const filtered = logs.filter(l => {
    const matchDate = !filterDate || l.exit_time?.startsWith(filterDate);
    const matchName = !filterName || l.student_name.toLowerCase().includes(filterName.toLowerCase());
    const matchDept = filterDept === 'All' || l.department === filterDept;
    return matchDate && matchName && matchDept;
  });

  const getMovementBadge = (status) => {
    if (status === 'returned') return 'badge-success';
    if (status === 'outside') return 'badge-warning';
    if (status === 'overdue') return 'badge-danger';
    return '';
  };

  const getMovementLabel = (status) => {
    if (status === 'returned') return 'Returned';
    if (status === 'outside') return 'Outside';
    if (status === 'overdue') return 'Overdue';
    return status;
  };

  if (loading) return <LoadingState fullScreen text="Loading OS Dashboard..." />;

  return (
    <PageTransition>
      <motion.h1
        className="text-3xl font-bold mb-6 text-[var(--text-primary)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Office Superintendent Dashboard
      </motion.h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Exits Today" value={stats.exitsToday} icon={LogOut} color="blue" delay={0} />
        <DashboardCard title="Returns Today" value={stats.returnsToday} icon={LogIn} color="green" delay={0.1} />
        <DashboardCard title="Currently Outside" value={stats.outside} icon={Users} color="yellow" delay={0.2} />
        <DashboardCard title="Overdue Students" value={stats.overdue} icon={AlertTriangle} color="red" delay={0.3} />
      </div>

      {/* Movement Logs Table */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Student Movement Logs</h2>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              className="input text-sm py-1.5 w-auto"
              placeholder="Search student..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <select
              className="input text-sm py-1.5 w-auto"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
            </select>
            <input
              type="date"
              className="input text-sm py-1.5 w-auto"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button className="btn btn-secondary flex items-center gap-1 text-sm py-1.5 px-3">
              <Download size={14} /> Download Report
            </button>
          </div>
        </div>

        {/* Overdue Alert Banner */}
        {stats.overdue > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <AlertTriangle size={16} />
            <span>{stats.overdue} student(s) are overdue and have not returned yet.</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No movement logs found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Destination</th>
                  <th>Exit Time</th>
                  <th>Return Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {filtered.map((log) => (
                  <motion.tr
                    key={log.id}
                    variants={listItemVariants}
                    className={log.status === 'overdue' ? 'bg-red-50/50' : ''}
                  >
                    <td>#{log.id}</td>
                    <td>
                      <div>
                        <p className="font-medium">{log.student_name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{log.student_roll}</p>
                      </div>
                    </td>
                    <td>{log.department}</td>
                    <td>{log.destination}</td>
                    <td>{formatDateTime(log.exit_time)}</td>
                    <td>{log.return_time ? formatDateTime(log.return_time) : <span className="text-[var(--text-tertiary)]">—</span>}</td>
                    <td>
                      <span className={`badge ${getMovementBadge(log.status)}`}>
                        {getMovementLabel(log.status)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.div>
    </PageTransition>
  );
}
