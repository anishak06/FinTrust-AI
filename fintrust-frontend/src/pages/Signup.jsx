import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Cpu, AlertCircle, ArrowLeft, ClipboardList, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !username || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    // Password strength validation (Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':",./<>?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., FinTrust@2026).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await signup(username, password, fullName, role);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed. Username may already be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-[#010308]">
      {/* Background Animated Meshes & Grid */}
      <PremiumBackground />

      {/* Back to Home */}
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
        className="w-full max-w-md glass-card rounded-2xl p-8 border-white/10 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#59CFFF] to-[#102C57] flex items-center justify-center mb-3.5 border border-white/10">
            <Cpu className="h-5 w-5 text-[#59CFFF]" />
          </div>
          <h2 className="text-xl font-bold text-white">Create an account</h2>
          <p className="text-white/40 text-xs mt-1">Begin assessing alternative credit scores today</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#D1495B]/10 border border-[#D1495B]/20 text-[#D1495B] text-xs flex items-start gap-2 text-left">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#34C759] text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Full Name</label>
            <div className="relative">
              <ClipboardList className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sharma_rahul"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
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

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Account Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/30" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-xs appearance-none cursor-pointer bg-[#030E21]"
              >
                <option value="USER">Borrower Profile (Alternative score)</option>
                <option value="ADMIN">System Administrator (Lending Panel)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-lg btn-glow-sky text-xs font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40">
          Already registered?{' '}
          <Link to="/login" className="text-[#59CFFF] font-semibold hover:text-[#7ce0ff] transition-colors">
            Sign In Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
