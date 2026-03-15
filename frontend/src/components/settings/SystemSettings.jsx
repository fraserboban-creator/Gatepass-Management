'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Database, Download, FileText, Power, AlertCircle } from 'lucide-react';

export default function SystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backing, setBacking] = useState(false);

  const handleBackup = async () => {
    setBacking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Database backup completed successfully');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setBacking(false);
    }
  };

  const handleMaintenanceToggle = () => {
    setMaintenanceMode(!maintenanceMode);
    toast.success(maintenanceMode ? 'Maintenance mode disabled' : 'Maintenance mode enabled');
  };

  return (
    <div className="space-y-6">
      {/* Database Backup */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Database size={24} className="text-blue-600" />
          Database Backup
        </h2>

        <div className="space-y-4">
          <p className="text-gray-600">
            Create a backup of the entire database. This includes all users, gatepasses, visitor passes, and system data.
          </p>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Last Backup:</strong> March 13, 2026 at 11:30 PM
            </p>
            <p className="text-sm text-blue-800">
              <strong>Backup Size:</strong> 45.2 MB
            </p>
          </div>

          <button
            onClick={handleBackup}
            disabled={backing}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download size={16} />
            {backing ? 'Creating Backup...' : 'Create Backup Now'}
          </button>
        </div>
      </div>

      {/* System Logs */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <FileText size={24} className="text-green-600" />
          System Logs
        </h2>

        <div className="space-y-4">
          <p className="text-gray-600">
            View and download system logs for debugging and monitoring purposes.
          </p>

          <div className="space-y-2">
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2">
              <FileText size={16} />
              View Application Logs
            </button>
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2">
              <FileText size={16} />
              View Error Logs
            </button>
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2">
              <Download size={16} />
              Download All Logs
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Power size={24} className="text-red-600" />
          Maintenance Mode
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium mb-1">
                Warning: Maintenance Mode
              </p>
              <p className="text-sm text-yellow-700">
                Enabling maintenance mode will prevent all users except administrators from accessing the system.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-600">
                {maintenanceMode ? 'System is currently in maintenance mode' : 'System is operational'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={handleMaintenanceToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
