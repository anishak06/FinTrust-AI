import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Cpu, AlertCircle, ArrowLeft, ClipboardList, Briefcase, Building, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';

export default function LenderSignup() {
  const { lenderSignup } = useAuth();
  const navigate = useNavigate();

  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bankName || !branchName || !employeeName || !employeeId || !designation || !email || !mobileNumber || !bankAddress || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':",./<>?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., Bank@2026).');
      return;
    }

    setLoading(true);

    const result = await lenderSignup({
      bankName,
      branchName,
      employeeName,
      employeeId,
      designation,
      email,
      mobileNumber,
      bankAddress,
      password,
      confirmPassword
    });

    if (result.success) {
      setSuccess('Lender profile created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/lender/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed. Email might already be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-[#081C3A]">
      <PremiumBackground />

      <div className="absolute top-8 left-8 z-20">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg glass-card rounded-2xl p-8 border-white/10 relative z-10 text-left"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#102C57] flex items-center justify-center mb-3.5 border border-white/10">
            <Building className="h-5 w-5 text-[#38BDF8]" />
          </div>
          <h2 className="text-xl font-bold text-white">NBFC / Bank Registration</h2>
          <p className="text-white/40 text-xs mt-1">Register a lender account to review alternative credit decisions</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Bank / NBFC Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Branch Name</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Connaught Place"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Employee Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. Anil Kumar"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Employee ID</label>
              <div className="relative">
                <ClipboardList className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP45980"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Designation</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Credit Underwriting Manager"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Official Bank Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anil.k@hdfc.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Bank Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
              <input
                type="text"
                value={bankAddress}
                onChange={(e) => setBankAddress(e.target.value)}
                placeholder="Plot 45, Sector 12, Corporate Block, Mumbai"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Confirm Password</label>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-lg bg-[#38BDF8] hover:bg-[#30a9dd] text-[#081C3A] text-xs font-bold transition-all disabled:opacity-50 text-center flex justify-center items-center cursor-pointer"
          >
            {loading ? 'Processing Registration...' : 'Register as Lender'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40">
          Already registered?{' '}
          <Link to="/lender/login" className="text-[#38BDF8] font-semibold hover:text-[#5bc8f8] transition-colors">
            Lender Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
