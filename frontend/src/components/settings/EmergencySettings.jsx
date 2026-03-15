'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Plus, Trash2, Save } from 'lucide-react';

export default function EmergencySettings() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Hostel Warden', phone: '+1234567890', email: 'warden@hostel.com' },
    { id: 2, name: 'Security Office', phone: '+1234567891', email: 'security@hostel.com' },
    { id: 3, name: 'Coordinator', phone: '+1234567892', email: 'coordinator@hostel.com' }
  ]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Emergency contacts saved');
    } catch (error) {
      toast.error('Failed to save contacts');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle size={24} className="text-red-600" />
          Emergency Settings
        </h2>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-900">{contact.name}</p>
              <p className="text-sm text-gray-600">{contact.phone}</p>
              <p className="text-sm text-gray-600">{contact.email}</p>
            </div>
            <button className="text-red-600 hover:text-red-800">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
