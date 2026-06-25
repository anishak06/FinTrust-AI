import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, TrendingUp, Users, ArrowRight, Award, Zap, Layers, HelpCircle, Activity } from 'lucide-react';
import CurrencyShower from '../components/CurrencyShower';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleEligibility = () => {
    if (isAuthenticated) {
      navigate('/check-eligibility');
    } else {
      navigate('/login?redirect=check-eligibility');
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#071B3B]">
      {/* Falling Currency Experience */}
      <CurrencyShower />

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1b478a] opacity-35 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#0a254d] opacity-50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-[#59cfff] opacity-10 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#071B3B]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#59CFFF] to-[#143c75] shadow-sky-glow">
              <Cpu className="h-6 w-6 text-[#071B3B]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              FinTrust<span className="text-[#59CFFF] font-light">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-5 py-2 text-white hover:text-[#59CFFF] font-medium transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="px-5 py-2 rounded-lg btn-glow-sky text-[#071B3B] font-semibold"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24 text-center md:pt-24 lg:pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-[#59CFFF] uppercase bg-[#59CFFF]/10 rounded-full border border-[#59CFFF]/25">
            Next-Gen Alternative Credit Scoring
          </span>
          <h1 className="mx-auto max-w-5xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-sans leading-[1.1] mb-6">
            Transforming Financial Behavior Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59CFFF] via-white to-[#F5E6D3]">Credit Opportunities</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/70 sm:text-xl font-sans font-light leading-relaxed mb-10">
            AI-powered creditworthiness analysis designed specifically for the credit-invisible population. We evaluate savings, bill payments, and digital transaction patterns instead of legacy bank histories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-xl btn-glow-sky text-[#071B3B] font-bold text-lg flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={handleEligibility}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/25 text-white font-semibold text-lg transition-all"
            >
              Check Eligibility
            </button>
          </div>
        </motion.div>

        {/* Hero Interactive Illustration Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mx-auto max-w-4xl glass-card rounded-2xl p-6 md:p-8 shadow-sky-glow border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#59CFFF]/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-red-500/80" />
              <span className="h-3.5 w-3.5 rounded-full bg-yellow-500/80" />
              <span className="h-3.5 w-3.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-white/40">FINT-ENGINE_v2.0 // ACTIVE</span>
            </div>
            <div className="px-3 py-1 rounded bg-[#59CFFF]/10 border border-[#59CFFF]/20 text-[#59CFFF] text-xs font-semibold">
              Gemini 1.5 Flash Enabled
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-navy-deep/40 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Alternative Credit Score</span>
              <span className="text-4xl font-extrabold text-[#59CFFF] font-sans">845<span className="text-xs text-white/50 font-normal">/900</span></span>
              <span className="text-xs text-emerald-400 font-medium">✨ Excellent Financial Health</span>
            </div>
            <div className="p-4 bg-navy-deep/40 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Loan Eligibility</span>
              <span className="text-2xl font-bold text-white font-sans">Eligible</span>
              <span className="text-xs text-white/60">Suggested Amount: <b className="text-[#F5E6D3]">₹2,50,000</b></span>
            </div>
            <div className="p-4 bg-navy-deep/40 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Risk Probability</span>
              <span className="text-2xl font-bold text-emerald-400 font-sans">Low Risk</span>
              <span className="text-xs text-white/40">Confidence Level: 96%</span>
            </div>
          </div>

          {/* Simple Animated Graph simulation */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-[#F5E6D3]">Explainable AI Breakdown:</span>
              <span className="text-white/50 text-xs">Behavioral Score Matrix</span>
            </div>
            <div className="space-y-2 mt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Consistent Savings Habits</span>
                  <span className="text-[#59CFFF] font-semibold">+120 Points</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#143c75] to-[#59CFFF] rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Timely Utility & Mobile Payments</span>
                  <span className="text-[#59CFFF] font-semibold">+110 Points</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#143c75] to-[#59CFFF] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Digital Footprint (UPI Patterns)</span>
                  <span className="text-[#59CFFF] font-semibold">+50 Points</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#143c75] to-[#59CFFF] rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20 bg-navy-deep/45 border-y border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-sans md:text-4xl mb-4 text-white">
              The Problem We Solve
            </h2>
            <div className="h-1.5 w-16 bg-[#59CFFF] mx-auto rounded-full mb-6" />
            <p className="text-white/70 text-lg font-light leading-relaxed">
              Traditional credit bureaus require a credit history to give you a credit score. This creates a paradox that locks out millions of financially responsible individuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">The "Credit-Invisible" Population</h3>
                  <p className="text-white/60 text-sm">Over 1.4 billion adults worldwide have no credit record. They are locked out of prime loans and forced to rely on predatory lenders.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Rigid Scoring Algorithms</h3>
                  <p className="text-white/60 text-sm">Standard scoring agencies penalize users for not having active credit cards or prior debt, ignoring consistent income, cash savings, or utility payments.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Lack of Explainability</h3>
                  <p className="text-white/60 text-sm">When traditional applications are rejected, users receive no clear explanation or roadmap detailing how to fix their status.</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border-white/5 space-y-4">
              <h4 className="text-xl font-bold text-[#F5E6D3]">How FinTrust AI Resolves This</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                We bridge the gap using modern digital telemetry. By securely evaluating alternative data footprints, we allow you to build an investor-ready credit history without taking on debt.
              </p>
              <div className="p-4 bg-navy-medium/50 rounded-lg border border-[#59CFFF]/10 text-xs text-white/65 italic">
                "FinTrust AI allows unbanked micro-merchants and gig workers to prove creditworthiness, allowing banks to underwrite them safely."
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-white/50 pt-2">
                <span>ALTERNATIVE TELEMETRY ENGINE</span>
                <span className="text-[#59CFFF]">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-sans md:text-4xl mb-4 text-white">
              How FinTrust AI Works
            </h2>
            <div className="h-1.5 w-16 bg-[#59CFFF] mx-auto rounded-full mb-6" />
            <p className="text-white/70 text-lg font-light">Three simple steps to establish your digital financial identity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#59CFFF]/25 to-transparent hidden md:block z-0" />
            
            <div className="glass-card p-8 rounded-2xl border-white/5 text-center relative z-10 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#59CFFF]/10 border border-[#59CFFF]/20 text-[#59CFFF] text-2xl font-black mb-6">1</div>
              <h3 className="text-xl font-bold text-white mb-3">Provide Alternative Data</h3>
              <p className="text-white/60 text-sm">Input behavioral stats including savings habits, utility payments, and digital transaction volume via our secure interface.</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl border-white/5 text-center relative z-10 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#59CFFF]/10 border border-[#59CFFF]/20 text-[#59CFFF] text-2xl font-black mb-6">2</div>
              <h3 className="text-xl font-bold text-white mb-3">AI Engine Analysis</h3>
              <p className="text-white/60 text-sm">Our advanced Gemini model analyzes variables, evaluating income stability, transaction patterns, and savings ratios.</p>
            </div>

            <div className="glass-card p-8 rounded-2xl border-white/5 text-center relative z-10 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#59CFFF]/10 border border-[#59CFFF]/20 text-[#59CFFF] text-2xl font-black mb-6">3</div>
              <h3 className="text-xl font-bold text-white mb-3">Unlock Credit & Coaching</h3>
              <p className="text-white/60 text-sm">Get an explainable score, view loan eligibility estimates, and receive custom coaching guides to improve score trends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-navy-deep/45 border-y border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-sans md:text-4xl mb-4 text-white">
              Features Designed For Scale
            </h2>
            <div className="h-1.5 w-16 bg-[#59CFFF] mx-auto rounded-full mb-6" />
            <p className="text-white/70 text-lg font-light">Innovative tools packed inside a premium SaaS dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card glass-card-hover p-6 rounded-xl text-left border-white/5">
              <Cpu className="h-8 w-8 text-[#59CFFF] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Gemini-Powered Scoring</h3>
              <p className="text-white/60 text-sm">High-performance AI model evaluates complex behavioral telemetry variables to output creditworthiness scoring.</p>
            </div>
            
            <div className="glass-card glass-card-hover p-6 rounded-xl text-left border-white/5">
              <Layers className="h-8 w-8 text-[#59CFFF] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Explainable Score Matrix</h3>
              <p className="text-white/60 text-sm">View direct line-item point assignments (e.g. +120 savings, -20 excess spending) so you understand the exact score origin.</p>
            </div>

            <div className="glass-card glass-card-hover p-6 rounded-xl text-left border-white/5">
              <TrendingUp className="h-8 w-8 text-[#59CFFF] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Goal Savings Planner</h3>
              <p className="text-white/60 text-sm">Create and track concrete financial goals like laptop purchases or education funds, calculating exact savings schedules.</p>
            </div>

            <div className="glass-card glass-card-hover p-6 rounded-xl text-left border-white/5">
              <ShieldCheck className="h-8 w-8 text-[#59CFFF] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Secure Authentication</h3>
              <p className="text-white/60 text-sm">Powered by stateless JWT keys, protecting sensitive user-profile credentials and financial information.</p>
            </div>

            <div className="glass-card glass-card-hover p-6 rounded-xl text-left border-white/5">
              <Award className="h-8 w-8 text-[#59CFFF] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Alternative Loan Underwriting</h3>
              <p className="text-white/60 text-sm">Predicts loan eligibility, offers suggested loan amounts, and reports confidence metrics for financial institution partners.</p>
            </div>

            <div className="glass-card glass-card-hover p-6 rounded-xl text-left border-white/5">
              <HelpCircle className="h-8 w-8 text-[#59CFFF] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Financial Health Coach</h3>
              <p className="text-white/60 text-sm">Continuous, personalized suggestions generated by LLM to optimize budgets and raise scores over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Inclusion Section */}
      <section className="py-20 relative z-10 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold font-sans md:text-4xl mb-4 text-white">Financial Inclusion Impact</h2>
          <div className="h-1.5 w-16 bg-[#59CFFF] mx-auto rounded-full mb-12" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-navy-medium/30 rounded-xl border border-white/5">
              <span className="block text-4xl lg:text-5xl font-extrabold text-[#59CFFF] font-sans mb-2">1.4B+</span>
              <span className="text-xs uppercase tracking-wider text-white/50">Credit Invisibles Worldwide</span>
            </div>
            <div className="p-6 bg-navy-medium/30 rounded-xl border border-white/5">
              <span className="block text-4xl lg:text-5xl font-extrabold text-[#59CFFF] font-sans mb-2">96%</span>
              <span className="text-xs uppercase tracking-wider text-white/50">AI Scoring Accuracy</span>
            </div>
            <div className="p-6 bg-navy-medium/30 rounded-xl border border-white/5">
              <span className="block text-4xl lg:text-5xl font-extrabold text-[#59CFFF] font-sans mb-2">₹10K-5L</span>
              <span className="text-xs uppercase tracking-wider text-white/50">Supported Loan Bracket</span>
            </div>
            <div className="p-6 bg-navy-medium/30 rounded-xl border border-white/5">
              <span className="block text-4xl lg:text-5xl font-extrabold text-[#59CFFF] font-sans mb-2">35%</span>
              <span className="text-xs uppercase tracking-wider text-white/50">Average Savings Growth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-navy-deep/45 border-y border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-sans md:text-4xl mb-4 text-white">What Borrowers Say</h2>
            <div className="h-1.5 w-16 bg-[#59CFFF] mx-auto rounded-full mb-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-xl border-white/5 text-left flex flex-col justify-between">
              <p className="text-white/80 text-sm leading-relaxed italic mb-6">
                "As a freelance designer, legacy banks rejected my loan applications because I didn't have a salaried job history. FinTrust AI evaluated my consistent monthly savings and client UPI invoices. Within hours, I received a FinTrust score of 780 and secured my first laptop loan!"
              </p>
              <div>
                <h4 className="font-bold text-[#59CFFF] text-sm">Rahul Sharma</h4>
                <span className="text-xs text-white/40">Freelance UI Designer, Pune</span>
              </div>
            </div>
            
            <div className="glass-card p-8 rounded-xl border-white/5 text-left flex flex-col justify-between">
              <p className="text-white/80 text-sm leading-relaxed italic mb-6">
                "Operating a local grocery shop makes traditional bank paperwork nearly impossible. By sharing my UPI transaction flows and utility bill payment logs with FinTrust AI, I unlocked an alternative credit score that local banking partners accepted immediately."
              </p>
              <div>
                <h4 className="font-bold text-[#59CFFF] text-sm">Priya Patel</h4>
                <span className="text-xs text-white/40">Retail Shop Owner, Ahmedabad</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Scope */}
      <section className="py-20 relative z-10 text-left">
        <div className="mx-auto max-w-4xl px-6 glass-card p-8 rounded-2xl border-white/5 bg-gradient-to-r from-navy-medium to-navy-dark">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-[#59CFFF]" /> Future Scope & Expansion
          </h2>
          <div className="h-1 w-12 bg-[#59CFFF] rounded-full mb-6" />
          <ul className="space-y-4 text-white/70 text-sm">
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 rounded-full bg-[#59CFFF] mt-1.5 shrink-0" />
              <span><b>Decentralized Financial Identity:</b> Integrating blockchain based cryptographic storage to secure user profiles and ensure GDPR/consent data control.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 rounded-full bg-[#59CFFF] mt-1.5 shrink-0" />
              <span><b>Micro-Credit Brokerage:</b> Direct API integrations with national banks and fintech providers to instantly underwrite and disburse loans directly inside the dashboard.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 rounded-full bg-[#59CFFF] mt-1.5 shrink-0" />
              <span><b>Advanced Behavioral AI Models:</b> Harnessing multi-modal LLMs to ingest physical paper bank receipts via optical OCR reading and parse cash-based credit variables.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-navy-deep relative z-10 text-center text-sm text-white/40">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#59CFFF]" />
            <span className="font-bold text-white">FinTrust AI</span>
          </div>
          <span>&copy; {new Date().getFullYear()} FinTrust AI. All rights reserved. Empowering financial inclusion.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#59CFFF] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#59CFFF] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#59CFFF] transition-colors">Developer API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
