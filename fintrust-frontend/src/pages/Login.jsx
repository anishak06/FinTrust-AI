import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Cpu, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Password modal simulation
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const redirect = searchParams.get('redirect') || 'dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      navigate('/' + (redirect === 'dashboard' ? 'dashboard' : redirect));
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetUsername) {
      setResetError('Please enter your username.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    const result = await forgotPassword(resetUsername);
    setResetLoading(false);

    if (result.success) {
      setResetMessage(result.message);
      setTimeout(() => {
        setForgotModalOpen(false);
        setResetUsername('');
        setResetMessage('');
      }, 5000);
    } else {
      setResetError(result.error || 'Username not found.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-[#071B3B]">
      {/* Decorative Spheres */}
      <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-[#143c75] opacity-30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-[#0a254d] opacity-40 blur-[120px] pointer-events-none" />

      {/* Back button */}
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
          <h2 className="text-2xl font-bold font-sans text-white">Welcome to FinTrust AI</h2>
          <p className="text-white/60 text-xs mt-1">Sign in to manage your alternative credit profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Username / Email</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-11 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Password</label>
              <button 
                type="button" 
                onClick={() => setForgotModalOpen(true)}
                className="text-xs text-[#59CFFF] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-lg btn-glow-sky text-[#071B3B] font-bold text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/50">
          New to the platform?{' '}
          <Link to="/signup" className="text-[#59CFFF] font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm glass-card rounded-xl p-6 border-white/10"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-bold text-white text-base">Recover Password</h3>
              <button 
                onClick={() => setForgotModalOpen(false)}
                className="text-white/40 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {resetMessage ? (
              <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {resetMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left">
                <p className="text-white/70 text-xs leading-relaxed">
                  Enter your registered username, and we will send a password reset simulation link.
                </p>
                {resetError && <div className="text-red-400 text-xs">{resetError}</div>}
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-white/50 tracking-wider">Username</label>
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    placeholder="e.g. sharma_rahul"
                    className="w-full px-3 py-2 rounded glass-input text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 rounded bg-[#59CFFF] text-[#071B3B] font-bold text-xs flex justify-center items-center gap-1.5"
                >
                  <Send className="h-3 w-3" /> {resetLoading ? 'Sending...' : 'Send Recovery Link'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
