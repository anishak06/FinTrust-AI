import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Cpu, AlertCircle, ArrowLeft, ClipboardList, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-[#071B3B]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[15%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-[#143c75] opacity-25 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[15%] w-[30vw] h-[30vw] rounded-full bg-[#0a254d] opacity-35 blur-[100px] pointer-events-none" />

      {/* Back to Home */}
      <div className="absolute top-8 left-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-card rounded-2xl p-8 border-white/10 shadow-sky-glow relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#59CFFF] to-[#143c75] flex items-center justify-center mb-3 shadow-sky-glow">
            <Cpu className="h-7 w-7 text-[#071B3B]" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-white">Create your Account</h2>
          <p className="text-white/60 text-xs mt-1">Begin assessing alternative credit scores today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Full Name</label>
            <div className="relative">
              <ClipboardList className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/40" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sharma_rahul"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Account Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/40" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-sm appearance-none cursor-pointer bg-navy-dark"
              >
                <option value="USER">Standard User (Alternative Borrower)</option>
                <option value="ADMIN">System Administrator (Lending Evaluator)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-lg btn-glow-sky text-[#071B3B] font-bold text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/50">
          Already registered?{' '}
          <Link to="/login" className="text-[#59CFFF] font-semibold hover:underline">
            Sign In Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
