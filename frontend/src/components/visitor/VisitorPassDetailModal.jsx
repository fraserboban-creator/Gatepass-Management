'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, User, Phone, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import Modal from '@/components/common/Modal';

const statusColors = {
  pending:  'bg-yellow-100 text-yellow-800 border border-yellow-300',
  approved: 'bg-green-100  text-green-800  border border-green-300',
  rejected: 'bg-red-100    text-red-800    border border-red-300',
  active:   'bg-blue-100   text-blue-800   border border-blue-300',
  exited:   'bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-primary)]',
  overdue:  'bg-red-100    text-red-800    border border-red-300',
};

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-tertiary)] mb-0.5">{label}</p>
      <p className="font-medium text-[var(--text-primary)] text-sm">{value}</p>
    </div>
  );
}

function Section({ icon: Icon, iconColor, title, children }) {
  return (
    <motion.div
      className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <Icon size={16} className={iconColor} />
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </motion.div>
  );
}

export default function VisitorPassDetailModal({ isOpen, onClose, passId }) {
  const [pass, setPass]       = useState(null);
  const [qrCode, setQrCode]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (isOpen && passId) fetchPassDetails();
  }, [isOpen, passId]);

  const fetchPassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const passResponse = await api.get(`/visitor-pass/${passId}`);
      setPass(passResponse.data.data.pass);
      try {
        const qrResponse = await api.post(`/visitor-pass/${passId}/qr`);
        setQrCode(qrResponse.data.data);
      } catch { /* QR optional */ }
    } catch {
      setError('Failed to load visitor pass details');
      toast.error('Failed to load visitor pass details');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode?.qrCode) { toast.error('QR code not available'); return; }
    try {
      const link = document.createElement('a');
      link.href = qrCode.qrCode;
      link.download = `visitor-pass-qr-${pass.pass_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded');
    } catch { toast.error('Failed to download QR code'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Visitor Pass Details" maxWidth="max-w-3xl">
      <div className="p-6 overflow-y-auto max-h-[75vh]">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-secondary)]">Loading details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchPassDetails} className="btn btn-primary">Try Again</button>
          </div>
        ) : pass ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left — details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Status row */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[pass.status] || statusColors.pending}`}>
                  {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">Pass ID: {pass.pass_id}</span>
              </div>

              <Section icon={User} iconColor="text-blue-500" title="Visitor Information">
                <InfoRow label="Name"        value={pass.visitor_name} />
                <InfoRow label="Phone"       value={pass.visitor_phone} />
                <InfoRow label="ID Type"     value={pass.visitor_id_type} />
                <InfoRow label="ID Number"   value={pass.visitor_id_number} />
                {pass.relationship && <InfoRow label="Relationship" value={pass.relationship} />}
              </Section>

              <Section icon={Users} iconColor="text-green-500" title="Student Information">
                <InfoRow label="Student Name" value={pass.student_name} />
                <InfoRow label="Room Number"  value={pass.room_number} />
              </Section>

              <Section icon={Calendar} iconColor="text-purple-500" title="Visit Details">
                <div className="col-span-2">
                  <InfoRow label="Purpose" value={pass.purpose} />
                </div>
                <InfoRow label="Expected Exit"   value={formatDateTime(pass.expected_exit_time)} />
                {pass.entry_time       && <InfoRow label="Entry Time"       value={formatDateTime(pass.entry_time)} />}
                {pass.actual_exit_time && <InfoRow label="Actual Exit Time" value={formatDateTime(pass.actual_exit_time)} />}
              </Section>
            </div>

            {/* Right — QR */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 sticky top-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] text-center mb-3">QR Code</h3>
                {qrCode?.qrCode ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-[var(--border-primary)]">
                      <img src={qrCode.qrCode} alt="Visitor Pass QR Code" className="w-full h-auto" />
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] text-center">Scan at security checkpoint</p>
                    <button onClick={downloadQRCode} className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm">
                      <Download size={14} /> Download QR
                    </button>
                    {qrCode.expires_at && (
                      <p className="text-xs text-[var(--text-tertiary)] text-center">Expires: {formatDateTime(qrCode.expires_at)}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-[var(--text-secondary)]">QR code not available</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Pass must be approved first</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--border-primary)] flex justify-end">
        <button onClick={onClose} className="btn btn-secondary">Close</button>
      </div>
    </Modal>
  );
}
