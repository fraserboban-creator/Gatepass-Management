'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, Save } from 'lucide-react';

export default function HostelRulesSettings() {
  const [rules, setRules] = useState({
    max_gatepass_duration: 3,
    visitor_start_time: '10:00',
    visitor_end_time: '20:00',
    curfew_time: '22:30',
    late_return_penalty: 'Warning on first offense, fine on subsequent offenses'
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setRules({
      ...rules,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Hostel rules updated successfully');
    } catch (error) {
      toast.error('Failed to update rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <BookOpen size={24} className="text-blue-600" />
        Hostel Rules Configuration
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Gatepass Duration (days)
          </label>
          <input
            type="number"
            name="max_gatepass_duration"
            value={rules.max_gatepass_duration}
            onChange={handleChange}
            className="input"
            min={1}
            max={30}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitor Allowed Start Time
            </label>
            <input
              type="time"
              name="visitor_start_time"
              value={rules.visitor_start_time}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitor Allowed End Time
            </label>
            <input
              type="time"
              name="visitor_end_time"
              value={rules.visitor_end_time}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hostel Curfew Time
          </label>
          <input
            type="time"
            name="curfew_time"
            value={rules.curfew_time}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Late Return Penalty
          </label>
          <textarea
            name="late_return_penalty"
            value={rules.late_return_penalty}
            onChange={handleChange}
            className="input"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Rules'}
          </button>
        </div>
      </div>
    </div>
  );
}
