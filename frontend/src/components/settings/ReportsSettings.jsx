'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, Users as UsersIcon, BarChart } from 'lucide-react';

export default function ReportsSettings() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (reportType, format) => {
    setDownloading(`${reportType}-${format}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${reportType} report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: 'gatepass',
      title: 'Gatepass History',
      description: 'Download complete gatepass history with all details',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 'visitor',
      title: 'Visitor Logs',
      description: 'Download visitor pass logs and statistics',
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      id: 'analytics',
      title: 'Analytics Report',
      description: 'Download comprehensive analytics and insights',
      icon: BarChart,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Download size={24} className="text-blue-600" />
        Reports & Data Export
      </h2>

      <div className="space-y-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-4">
                <Icon size={32} className={report.color} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(report.title, 'csv')}
                      disabled={downloading === `${report.title}-csv`}
                      className="btn btn-sm btn-secondary flex items-center gap-2"
                    >
                      <Download size={14} />
                      {downloading === `${report.title}-csv` ? 'Downloading...' : 'Download CSV'}
                    </button>
                    <button
                      onClick={() => handleDownload(report.title, 'pdf')}
                      disabled={downloading === `${report.title}-pdf`}
                      className="btn btn-sm btn-secondary flex items-center gap-2"
                    >
                      <Download size={14} />
                      {downloading === `${report.title}-pdf` ? 'Downloading...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Reports include data from the last 90 days. For custom date ranges, contact the administrator.
        </p>
      </div>
    </div>
  );
}
