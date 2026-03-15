'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';

export default function GatepassDetails() {
  const router = useRouter();
  const params = useParams();
  const [gatepass, setGatepass] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGatepassDetails();
  }, [params.id]);

  const fetchGatepassDetails = async () => {
    try {
      const response = await api.get(`/gatepass/${params.id}`);
      setGatepass(response.data.data);
      
      // Fetch QR code if approved (includes coordinator_approved, approved, and completed)
      const approvedStatuses = ['coordinator_approved', 'approved', 'completed'];
      if (approvedStatuses.includes(response.data.data.status)) {
        try {
          const qrResponse = await api.get(`/qr/generate/${params.id}`);
          setQrCode(qrResponse.data.data.qrCode);
        } catch (error) {
          console.error('Failed to fetch QR code:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch gatepass:', error);
      alert('Failed to load gatepass details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!gatepass) {
    return <div>Gatepass not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gatepass Details</h1>
        <button
          onClick={() => router.push('/student/history')}
          className="btn btn-secondary"
        >
          ← Back to History
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Gatepass #{gatepass.id}</h2>
            <p className="text-gray-500 text-sm">Created: {formatDateTime(gatepass.created_at)}</p>
          </div>
          <span className={`badge ${getStatusBadgeClass(gatepass.status)}`}>
            {getStatusLabel(gatepass.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gatepass.enrollment_number && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Enrollment Number</label>
              <p className="text-lg">{gatepass.enrollment_number}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Destination</label>
            <p className="text-lg">{gatepass.destination}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
            <p className="text-lg">{gatepass.contact_number}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Leave Time</label>
            <p className="text-lg">{formatDateTime(gatepass.leave_time)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Expected Return</label>
            <p className="text-lg">{formatDateTime(gatepass.expected_return_time)}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
            <p className="text-lg">{gatepass.reason}</p>
          </div>
        </div>
      </div>

      {gatepass.approvals && gatepass.approvals.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Approval History</h3>
          <div className="space-y-3">
            {gatepass.approvals.map((approval, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{approval.approver_role.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">{approval.approver_name}</p>
                  </div>
                  <span className={`badge ${approval.action === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                    {approval.action}
                  </span>
                </div>
                {approval.comments && (
                  <p className="text-sm text-gray-700 mt-2">{approval.comments}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{formatDateTime(approval.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {qrCode && (
        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-4">QR Code</h3>
          <p className="text-sm text-gray-600 mb-4">Show this QR code at the gate</p>
          <div className="flex justify-center">
            <img src={qrCode} alt="Gatepass QR Code" className="max-w-xs" />
          </div>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrCode;
              link.download = `gatepass-${gatepass.id}.png`;
              link.click();
            }}
            className="btn btn-primary mt-4"
          >
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}
