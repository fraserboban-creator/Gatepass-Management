'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, User, Phone, IdCard, Users, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  active: 'bg-blue-100 text-blue-800 border-blue-300',
  exited: 'bg-gray-100 text-gray-800 border-gray-300',
  overdue: 'bg-red-100 text-red-800 border-red-300'
};

export default function VisitorPassDetailModal({ isOpen, onClose, passId }) {
  const [pass, setPass] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && passId) {
      fetchPassDetails();
    }
  }, [isOpen, passId]);

  const fetchPassDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pass details
      const passResponse = await api.get(`/visitor-pass/${passId}`);
      setPass(passResponse.data.data.pass);

      // Generate QR code
      try {
        const qrResponse = await api.post(`/visitor-pass/${passId}/qr`);
        setQrCode(qrResponse.data.data);
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError);
        // Don't fail the whole modal if QR generation fails
      }
    } catch (error) {
      console.error('Failed to fetch pass details:', error);
      setError('Failed to load visitor pass details');
      toast.error('Failed to load visitor pass details');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode || !qrCode.qrCode) {
      toast.error('QR code not available');
      return;
    }

    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = qrCode.qrCode;
      link.download = `visitor-pass-qr-${pass.pass_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded');
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Visitor Pass Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading visitor pass details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchPassDetails}
                  className="mt-4 btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : pass ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Pass Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[pass.status] || statusColors.pending}`}>
                      {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600">Pass ID: {pass.pass_id}</span>
                  </div>

                  {/* Visitor Information */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="text-blue-600" size={20} />
                      Visitor Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <p className="font-medium text-gray-900">{pass.visitor_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="font-medium text-gray-900">{pass.visitor_phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">ID Type</label>
                        <p className="font-medium text-gray-900">{pass.visitor_id_type}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">ID Number</label>
                        <p className="font-medium text-gray-900">{pass.visitor_id_number}</p>
                      </div>
                      {pass.relationship && (
                        <div>
                          <label className="text-sm text-gray-600">Relationship</label>
                          <p className="font-medium text-gray-900">{pass.relationship}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="text-green-600" size={20} />
                      Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Student Name</label>
                        <p className="font-medium text-gray-900">{pass.student_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Room Number</label>
                        <p className="font-medium text-gray-900">{pass.room_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Visit Details */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="text-purple-600" size={20} />
                      Visit Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Purpose of Visit</label>
                        <p className="font-medium text-gray-900">{pass.purpose}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Expected Exit Time</label>
                          <p className="font-medium text-gray-900">{formatDateTime(pass.expected_exit_time)}</p>
                        </div>
                        {pass.entry_time && (
                          <div>
                            <label className="text-sm text-gray-600">Entry Time</label>
                            <p className="font-medium text-gray-900">{formatDateTime(pass.entry_time)}</p>
                          </div>
                        )}
                        {pass.actual_exit_time && (
                          <div>
                            <label className="text-sm text-gray-600">Actual Exit Time</label>
                            <p className="font-medium text-gray-900">{formatDateTime(pass.actual_exit_time)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - QR Code */}
                <div className="lg:col-span-1">
                  <div className="card sticky top-24">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">QR Code</h3>
                    {qrCode && qrCode.qrCode ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                          <img
                            src={qrCode.qrCode}
                            alt="Visitor Pass QR Code"
                            className="w-full h-auto"
                          />
                        </div>
                        <p className="text-xs text-gray-600 text-center">
                          Scan this QR code at security checkpoint
                        </p>
                        <button
                          onClick={downloadQRCode}
                          className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Download QR Code
                        </button>
                        {qrCode.expires_at && (
                          <p className="text-xs text-gray-500 text-center">
                            Expires: {formatDateTime(qrCode.expires_at)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">QR code not available</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Pass must be approved to generate QR code
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
