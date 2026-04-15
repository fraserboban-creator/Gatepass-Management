'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import Modal from '@/components/common/Modal';

const ROLES = ['student', 'coordinator', 'warden', 'security', 'admin'];

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpData, setSignUpData] = useState({
    full_name: '', email: '', password: '', role: 'student',
    phone: '', room_number: '', hostel_block: '', student_id: '',
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Hardcoded demo credentials for HOD and OS
    const DEMO_USERS = {
      'hod@hostel.com': { password: 'Password@123', role: 'hod', full_name: 'Dr. Rajesh Kumar', id: 901 },
      'os@hostel.com':  { password: 'Password@123', role: 'os',  full_name: 'Mr. Suresh Nair',  id: 902 },
    };
    const demo = DEMO_USERS[formData.email];
    if (demo && demo.password === formData.password) {
      const fakeUser = { id: demo.id, email: formData.email, role: demo.role, full_name: demo.full_name, is_active: 1 };
      localStorage.setItem('token', btoa(JSON.stringify(fakeUser)) + '.demo');
      localStorage.setItem('user', JSON.stringify(fakeUser));
      setLoading(false);
      router.push(`/${demo.role}/dashboard`);
      return;
    }

    try {
      const result = await authService.login(formData.email, formData.password);
      if (result.success) router.push(`/${result.data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStatus('success');
      setForgotMsg('If that email exists, a reset link has been sent. Check your inbox.');
    } catch (err) {
      setForgotStatus('error');
      setForgotMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => { setShowForgot(false); setForgotEmail(''); setForgotStatus(''); setForgotMsg(''); };

  // ── Sign up ────────────────────────────────────────────────────────────────
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);
    try {
      await api.post('/auth/register', signUpData);
      setSignUpSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setSignUpError(data?.errors?.[0]?.msg || data?.message || 'Registration failed. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  const closeSignUp = () => {
    setShowSignUp(false); setSignUpError(''); setSignUpSuccess(false);
    setSignUpData({ full_name: '', email: '', password: '', role: 'student', phone: '', room_number: '', hostel_block: '', student_id: '' });
  };

  const inputClass = 'w-full px-4 py-2.5 border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-[var(--text-tertiary)]';

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-8 sm:p-10 border border-[var(--border-primary)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Hostel Gatepass</h1>
          <p className="text-[var(--text-secondary)] text-sm">Management System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address</label>
            <input
              type="email"
              className={inputClass}
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${inputClass} pr-12`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors mt-2">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => setShowForgot(true)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              Forgot Password?
            </button>
            <button type="button" onClick={() => setShowSignUp(true)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium">
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-primary)] text-center text-xs text-[var(--text-tertiary)]">
          <p>Hostel Gatepass Management System</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={showForgot} onClose={closeForgot} title="Forgot Password" maxWidth="max-w-sm">
        <div className="p-6">
          <p className="text-sm text-[var(--text-secondary)] mb-5">Enter your email and we'll send you a reset link.</p>
          {forgotStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
            >
              {forgotMsg}
            </motion.div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStatus === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {forgotMsg}
                </motion.div>
              )}
              <input type="email" className={inputClass} placeholder="Enter your email address"
                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              <button type="submit" disabled={forgotLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </Modal>

      {/* Sign Up Modal */}
      <Modal isOpen={showSignUp} onClose={closeSignUp} title="Create Account" maxWidth="max-w-md">
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <p className="text-sm text-[var(--text-secondary)] mb-5">Fill in your details to register.</p>
          {signUpSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Account Created!</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Your account has been created. You can now log in.</p>
              <button onClick={closeSignUp} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Go to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {signUpError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {signUpError}
                </motion.div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" className={inputClass} placeholder="John Doe" value={signUpData.full_name}
                  onChange={(e) => setSignUpData({ ...signUpData, full_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" className={inputClass} placeholder="john@example.com" value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showSignUpPassword ? 'text' : 'password'} className={`${inputClass} pr-10`}
                    placeholder="Min 8 chars, uppercase, number, symbol" value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                    {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Must include uppercase, lowercase, number & special character</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role <span className="text-red-500">*</span></label>
                <select className={inputClass} value={signUpData.role}
                  onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })} required>
                  {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone Number</label>
                <input type="tel" className={inputClass} placeholder="+91 9876543210" value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })} />
              </div>
              {signUpData.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Hostel Block</label>
                      <input type="text" className={inputClass} placeholder="A" value={signUpData.hostel_block}
                        onChange={(e) => setSignUpData({ ...signUpData, hostel_block: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Room Number</label>
                      <input type="text" className={inputClass} placeholder="A-101" value={signUpData.room_number}
                        onChange={(e) => setSignUpData({ ...signUpData, room_number: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Student ID</label>
                    <input type="text" className={inputClass} placeholder="STU2024001" value={signUpData.student_id}
                      onChange={(e) => setSignUpData({ ...signUpData, student_id: e.target.value })} />
                  </div>
                </>
              )}
              <button type="submit" disabled={signUpLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">
                {signUpLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className="text-center text-sm text-[var(--text-secondary)]">
                Already have an account?{' '}
                <button type="button" onClick={closeSignUp} className="text-blue-600 hover:underline font-medium">Log in</button>
              </p>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
