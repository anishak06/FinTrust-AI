import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Cpu, AlertCircle, ArrowLeft, Mail, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';

export default function LenderForgotPassword() {
  const { lenderForgotPassword, lenderResetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    const result = await lenderForgotPassword(email);

    if (result.success) {
      setSuccess('OTP code has been sent to your email.');
      setStep(2);
    } else {
      setError(result.error || 'Failed to send OTP. Please check the email address.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':",./<>?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setLoading(true);

    const result = await lenderResetPassword(email, otp, newPassword);

    if (result.success) {
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/lender/login');
      }, 2000);
    } else {
      setError(result.error || 'Password reset failed. Invalid or expired OTP.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-[#081C3A]">
      <PremiumBackground />

      <div className="absolute top-8 left-8 z-20">
        <button 
          onClick={() => navigate('/lender/login')}
          className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-card rounded-2xl p-8 border-white/10 relative z-10 text-left"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#102C57] flex items-center justify-center mb-3.5 border border-white/10">
            <Key className="h-5 w-5 text-[#38BDF8]" />
          </div>
          <h2 className="text-xl font-bold text-white">Reset Password</h2>
          <p className="text-white/40 text-xs mt-1">
            {step === 1 ? 'Enter your official email to request an OTP code' : 'Enter the OTP code and choose your new password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#D1495B]/10 border border-[#D1495B]/20 text-[#D1495B] text-xs flex items-start gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#34C759] text-xs text-center">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Official Bank Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anil.k@hdfc.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-lg bg-[#38BDF8] hover:bg-[#30a9dd] text-[#081C3A] text-xs font-bold transition-all disabled:opacity-50 text-center cursor-pointer"
            >
              {loading ? 'Sending OTP...' : 'Send Password OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Verification OTP</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP code"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-lg bg-[#38BDF8] hover:bg-[#30a9dd] text-[#081C3A] text-xs font-bold transition-all disabled:opacity-50 text-center cursor-pointer"
            >
              {loading ? 'Resetting Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
