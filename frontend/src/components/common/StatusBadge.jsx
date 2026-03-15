'use client';

import { CheckCircle, Clock, XCircle, AlertCircle, CheckCheck } from 'lucide-react';

export default function StatusBadge({ status, size = 'md', showIcon = true }) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'badge-pending',
    },
    coordinator_approved: {
      label: 'Coordinator Approved',
      icon: CheckCircle,
      className: 'badge-coordinator_approved',
    },
    approved: {
      label: 'Approved',
      icon: CheckCheck,
      className: 'badge-approved',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'badge-rejected',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'badge-completed',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  return (
    <span className={`badge ${config.className} ${sizeClasses[size]}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
