'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import api from '@/lib/api';
import { getStatusBadgeClass } from '@/lib/utils';
import QRScanner from '@/components/common/QRScanner';
import OverdueStudentsSection from '@/components/overdue/OverdueStudentsSection';

export default function SecurityDashboard() {
  const [gatepassInfo, setGatepassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const handleScan = async (qrData) => {
    setLoading(true);
    setError('');
    setGatepassInfo(null);
    setShowScanner(false);

    try {
      const response = await api.post('/qr/verify', { qrData });
      setGatepassInfo(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid QR code');
      setShowScanner(true);
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleMarkExit = async () => {
    try {
      await api.post(`/gatepass/${gatepassInfo.id}/exit`);
      alert('Exit marked successfully!');
      setGatepassInfo(null);
      setShowScanner(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark exit');
    }
  };

  const handleMarkReturn = async () => {
    try {
      await api.post(`/gatepass/${gatepassInfo.id}/return`);
      alert('Return marked successfully!');
      setGatepassInfo(null);
      setShowScanner(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark return');
    }
  };

  const handleScanAnother = () => {
    setGatepassInfo(null);
    setError('');
    setShowScanner(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Security Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.full_name}!</p>

      {/* Overdue Students Section */}
      <OverdueStudentsSection userRole="security" />

      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={handleScanAnother}
              className="ml-4 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="card mb-6 text-center py-8">
            <div className="text-2xl mb-2">⏳</div>
            <p>Verifying QR code...</p>
          </div>
        )}

        {showScanner && !loading && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
            <QRScanner onScan={handleScan} onError={handleScanError} />
          </div>
        )}

        {gatepassInfo && (
          <div className="card">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✓ Valid Gatepass
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Student</label>
                <p className="text-lg">{gatepassInfo.student_name}</p>
                <p className="text-sm text-gray-500">{gatepassInfo.student_roll}</p>
                {gatepassInfo.enrollment_number && (
                  <p className="text-sm text-gray-500">Enrollment: {gatepassInfo.enrollment_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Destination</label>
                <p className="text-lg">{gatepassInfo.destination}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Reason</label>
                <p className="text-lg">{gatepassInfo.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Leave Time</label>
                  <p>{new Date(gatepassInfo.leave_time).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Expected Return</label>
                  <p>{new Date(gatepassInfo.expected_return_time).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <span className={`badge ${getStatusBadgeClass(gatepassInfo.status)}`}>
                  {gatepassInfo.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex gap-4">
                {!gatepassInfo.actual_exit_time && (
                  <button
                    onClick={handleMarkExit}
                    className="btn btn-primary flex-1"
                  >
                    ✓ Mark Exit
                  </button>
                )}
                {gatepassInfo.actual_exit_time && !gatepassInfo.actual_return_time && (
                  <button
                    onClick={handleMarkReturn}
                    className="btn btn-secondary flex-1"
                  >
                    ✓ Mark Return
                  </button>
                )}
              </div>
              <button
                onClick={handleScanAnother}
                className="btn btn-secondary w-full"
              >
                Scan Another QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
