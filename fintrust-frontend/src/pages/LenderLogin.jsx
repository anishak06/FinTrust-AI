import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Cpu, AlertCircle, ArrowLeft, Mail, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';

export default function LenderLogin() {
  const { lenderLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    const result = await lenderLogin(email, password);

    if (result.success) {
      navigate('/lender/dashboard');
    } else {
      setError(result.error || 'Invalid credentials or connection issue.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-[#081C3A]">
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
        className="w-full max-w-md glass-card rounded-2xl p-8 border-white/10 relative z-10 text-left"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#102C57] flex items-center justify-center mb-3.5 border border-white/10">
            <Building className="h-5 w-5 text-[#38BDF8]" />
          </div>
          <h2 className="text-xl font-bold text-white">Lender Portal</h2>
          <p className="text-white/40 text-xs mt-1">Sign in with your official corporate bank credentials</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#D1495B]/10 border border-[#D1495B]/20 text-[#D1495B] text-xs flex items-start gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Password</label>
              <Link 
                to="/lender/forgot-password" 
                className="text-[10px] text-[#38BDF8] hover:text-[#5bc8f8] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-lg bg-[#38BDF8] hover:bg-[#30a9dd] text-[#081C3A] text-xs font-bold transition-all disabled:opacity-50 text-center cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In as Lender'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40">
          Not registered? Ask your administrator or{' '}
          <Link to="/lender/signup" className="text-[#38BDF8] font-semibold hover:text-[#5bc8f8] transition-colors">
            Sign Up Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
