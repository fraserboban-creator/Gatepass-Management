import { format, parseISO } from 'date-fns';

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status) {
  const statusMap = {
    pending: 'badge-pending',
    coordinator_approved: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    completed: 'badge-completed',
    expired: 'badge-rejected',
  };
  return statusMap[status] || 'badge-pending';
}

export function getStatusLabel(status) {
  const labelMap = {
    pending: 'Pending',
    coordinator_approved: 'Coordinator Approved',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    expired: 'Expired',
  };
  return labelMap[status] || status;
}

export function truncate(str, length = 50) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}
