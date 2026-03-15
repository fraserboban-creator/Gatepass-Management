'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, HelpCircle, Mail, AlertCircle } from 'lucide-react';
import { troubleshootingGuide, contactOptions } from '@/data/troubleshootingGuide';
import toast from 'react-hot-toast';

export default function HelpPanel({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  const filteredGuide = useMemo(() => {
    if (!searchTerm.trim()) return troubleshootingGuide;
    
    const term = searchTerm.toLowerCase();
    return troubleshootingGuide.filter(item =>
      item.problem.toLowerCase().includes(term) ||
      item.solution.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.keywords.some(keyword => keyword.includes(term))
    );
  }, [searchTerm]);

  const handleContact = (action) => {
    if (action === 'contact_warden') {
      toast.success('Warden contact information sent to your email');
    } else if (action === 'contact_coordinator') {
      toast.success('Coordinator contact information sent to your email');
    } else if (action === 'report_problem') {
      toast.success('Problem report form opened');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Help Panel */}
          <motion.div
            className="fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <HelpCircle size={28} />
                <h2 className="text-xl font-bold">Help & Troubleshooting</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'faq'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Contact
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'faq' ? (
                <div className="p-6 space-y-4">
                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search problems..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Results */}
                  {filteredGuide.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-600">No results found for "{searchTerm}"</p>
                      <p className="text-sm text-gray-500 mt-2">Try different keywords</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredGuide.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">❓</span>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {item.problem}
                              </h3>
                              <p className="text-xs text-gray-600 mt-2">
                                {item.solution}
                              </p>
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {contactOptions.map((option, index) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleContact(option.action)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {option.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">📧 Email Support</h4>
                    <p className="text-sm text-blue-800">
                      support@hostel-gatepass.com
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
