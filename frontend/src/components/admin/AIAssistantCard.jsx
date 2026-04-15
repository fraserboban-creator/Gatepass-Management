'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const SUGGESTIONS = [
  'Create a student named [Name] with email [email] and room A-101',
  'Update user with ID [id] to role coordinator',
  'Delete user with ID [id]',
  'Deactivate user with ID [id]',
  'Activate user with ID [id]',
];

const ACTION_COLORS = {
  create_user: 'bg-emerald-100 text-emerald-800',
  update_user: 'bg-blue-100 text-blue-800',
  delete_user: 'bg-red-100 text-red-800',
  deactivate_user: 'bg-amber-100 text-amber-800',
  activate_user: 'bg-green-100 text-green-800',
};

const ACTION_LABELS = {
  create_user: 'Create',
  update_user: 'Update',
  delete_user: 'Delete',
  deactivate_user: 'Deactivate',
  activate_user: 'Activate',
};

export default function AIAssistantCard({ onCommandExecuted, adminId }) {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [confirmCountdown, setConfirmCountdown] = useState(5);
  const [historyFilter, setHistoryFilter] = useState({ action: '', date: '' });
  const [inputFocused, setInputFocused] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);

  const dismissTimerRef = useRef(null);
  const countdownRef = useRef(null);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (historyFilter.action) params.append('action', historyFilter.action);
      if (historyFilter.date) params.append('date', historyFilter.date);
      const response = await api.get(`/admin/ai-command/history?${params.toString()}`);
      setHistory(response.data.data?.history || []);
    } catch (err) {
      console.error('Failed to fetch AI command history:', err);
    }
  };

  // Re-fetch when filter changes
  useEffect(() => {
    fetchHistory();
  }, [historyFilter]);

  const startDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => setResult(null), 5000);
  }, []);

  const startConfirmCountdown = useCallback(() => {
    setConfirmCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setConfirmCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (showConfirmation) startConfirmCountdown();
    else {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setConfirmCountdown(5);
    }
  }, [showConfirmation, startConfirmCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handleExecute = async () => {
    if (!command.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await api.post('/admin/ai-command', { command });
      const data = response.data;

      if (data.requiresConfirmation) {
        setConfirmationData({ ...data.data, commandId: data.commandId });
        setShowConfirmation(true);
      } else {
        const resultObj = {
          success: data.success,
          message: data.message || (data.success
            ? 'Command executed successfully.'
            : data.details
              ? data.details.map(e => e.message).join(', ')
              : 'Command failed.'),
          type: data.success ? 'success' : (data.error === 'unclear_command' ? 'unclear' : 'error'),
          timestamp: new Date().toISOString(),
        };
        setResult(resultObj);
        startDismissTimer();
        if (data.success && onCommandExecuted) onCommandExecuted();
        fetchHistory();
      }
    } catch (err) {
      const errData = err.response?.data;
      let errMsg = 'An error occurred while executing the command.';
      if (errData) {
        if (errData.message) {
          errMsg = errData.message;
        } else if (errData.details && Array.isArray(errData.details)) {
          errMsg = errData.details.map(e => e.message).join('. ');
        } else if (errData.error === 'validation_failed') {
          errMsg = 'Validation failed. Please check your command.';
        }
      }
      setResult({ success: false, message: errMsg, type: 'error', timestamp: new Date().toISOString() });
      startDismissTimer();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (confirmCountdown > 0 || !confirmationData) return;
    setIsLoading(true);
    try {
      const response = await api.post('/admin/ai-command/confirm', {
        commandId: confirmationData.commandId,
      });
      const data = response.data;
      setShowConfirmation(false);
      setConfirmationData(null);
      setResult({
        success: data.success,
        message: data.message || (data.success ? 'Action confirmed and executed.' : 'Confirmation failed.'),
        type: data.success ? 'success' : 'error',
        timestamp: new Date().toISOString(),
      });
      startDismissTimer();
      if (data.success && onCommandExecuted) onCommandExecuted();
      fetchHistory();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Confirmation failed.';
      setShowConfirmation(false);
      setConfirmationData(null);
      setResult({ success: false, message: errMsg, type: 'error', timestamp: new Date().toISOString() });
      startDismissTimer();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const filteredHistory = history.filter((entry) => {
    if (historyFilter.action && entry.action !== historyFilter.action) return false;
    if (historyFilter.date) {
      const entryDate = new Date(entry.created_at).toISOString().slice(0, 10);
      if (entryDate !== historyFilter.date) return false;
    }
    return true;
  }).slice(0, 20);

  const resultBoxClass =
    result?.type === 'success'
      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
      : result?.type === 'unclear'
      ? 'bg-yellow-50 border border-yellow-300 text-yellow-800'
      : 'bg-red-50 border border-red-300 text-red-800';

  const showSuggestions = inputFocused && command.trim() === '';

  return (
    <div className="card relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🤖</span>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">AI Admin Assistant</h2>
      </div>

      {/* Input area */}
      <div className="relative mb-3">
        <textarea
          className="input w-full resize-none h-24 pr-4 text-sm"
          maxLength={500}
          placeholder='Try: Create a student named Rahul Sharma with email rahul@gmail.com and room A-101'
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setTimeout(() => setInputFocused(false), 150)}
          disabled={isLoading}
        />
        <span className="absolute bottom-2 right-3 text-xs text-[var(--text-tertiary)]">
          {command.length}/500
        </span>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
            >
              <p className="px-3 py-2 text-xs font-semibold text-[var(--text-tertiary)] border-b border-slate-100">
                Example commands
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-blue-50 transition-colors"
                  onMouseDown={() => setCommand(s)}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        className="btn btn-primary w-full flex items-center justify-center gap-2 mb-4"
        onClick={handleExecute}
        disabled={isLoading || !command.trim()}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Executing...
          </>
        ) : (
          '⚡ Execute'
        )}
      </button>

      {/* Result feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`rounded-lg px-4 py-3 mb-4 text-sm ${resultBoxClass}`}
          >
            <div className="flex justify-between items-start gap-2">
              <span>{result.message}</span>
              <button
                className="text-xs opacity-60 hover:opacity-100 shrink-0"
                onClick={() => { setResult(null); if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); }}
              >
                ✕
              </button>
            </div>
            <p className="text-xs mt-1 opacity-60">{new Date(result.timestamp).toLocaleTimeString()}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command History */}
      <div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">Command History</h3>

        {/* Filters */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <select
            className="input text-sm py-1 px-2 h-auto"
            value={historyFilter.action}
            onChange={(e) => setHistoryFilter((f) => ({ ...f, action: e.target.value }))}
          >
            <option value="">All actions</option>
            <option value="create_user">Create</option>
            <option value="update_user">Update</option>
            <option value="delete_user">Delete</option>
            <option value="deactivate_user">Deactivate</option>
            <option value="activate_user">Activate</option>
          </select>
          <input
            type="date"
            className="input text-sm py-1 px-2 h-auto"
            value={historyFilter.date}
            onChange={(e) => setHistoryFilter((f) => ({ ...f, date: e.target.value }))}
          />
        </div>

        {/* History list */}
        {filteredHistory.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No history yet</p>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
              >
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${ACTION_COLORS[entry.action] || 'bg-slate-100 text-slate-700'}`}>
                    {ACTION_LABELS[entry.action] || entry.action}
                  </span>
                  <span className="text-sm text-[var(--text-primary)] truncate flex-1">
                    {entry.command_text?.length > 60
                      ? entry.command_text.slice(0, 60) + '…'
                      : entry.command_text}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                    entry.execution_status === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : entry.execution_status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {entry.execution_status}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>

                <AnimatePresence>
                  {expandedEntry === entry.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-[var(--text-secondary)] space-y-1"
                    >
                      <p><span className="font-medium">Full command:</span> {entry.command_text}</p>
                      {entry.parsed_data && (
                        <p><span className="font-medium">Parsed:</span> {typeof entry.parsed_data === 'string' ? entry.parsed_data : JSON.stringify(entry.parsed_data)}</p>
                      )}
                      {entry.execution_result && (
                        <p><span className="font-medium">Result:</span> {typeof entry.execution_result === 'string' ? entry.execution_result : JSON.stringify(entry.execution_result)}</p>
                      )}
                      {entry.error_message && (
                        <p className="text-red-600"><span className="font-medium">Error:</span> {entry.error_message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirmation && confirmationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-red-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="text-lg font-semibold text-slate-900">Confirm Destructive Action</h3>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm space-y-1">
                {confirmationData.parsed?.name && (
                  <p><span className="font-medium text-slate-700">Name:</span> {confirmationData.parsed.name}</p>
                )}
                {confirmationData.parsed?.email && (
                  <p><span className="font-medium text-slate-700">Email:</span> {confirmationData.parsed.email}</p>
                )}
                {confirmationData.parsed?.role && (
                  <p><span className="font-medium text-slate-700">Role:</span> {confirmationData.parsed.role}</p>
                )}
                {confirmationData.parsed?.user_id && (
                  <p><span className="font-medium text-slate-700">User ID:</span> {confirmationData.parsed.user_id}</p>
                )}
              </div>

              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-5">
                This action is irreversible. The user account will be permanently affected.
              </p>

              <div className="flex gap-3">
                <button
                  className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirm}
                  disabled={confirmCountdown > 0 || isLoading}
                >
                  {confirmCountdown > 0 ? `Confirm (${confirmCountdown}s)` : 'Confirm'}
                </button>
                <button
                  className="btn btn-outline flex-1"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
