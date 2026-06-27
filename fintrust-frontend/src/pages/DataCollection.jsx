import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, DollarSign, CreditCard, Sparkles, HelpCircle, Briefcase, FileText, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';

export default function DataCollection() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Helper to get current Month (Title case) and Year
  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const titleCaseMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1).toLowerCase();
  const currentYearNum = currentDate.getFullYear();

  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [utilityBillConsistency, setUtilityBillConsistency] = useState('CONSISTENT');
  const [upiTransactionFrequency, setUpiTransactionFrequency] = useState('');
  const [employmentType, setEmploymentType] = useState('SALARIED');
  const [occupation, setOccupation] = useState('');
  const [existingLoans, setExistingLoans] = useState('');
  const [month, setMonth] = useState(titleCaseMonth);
  const [year, setYear] = useState(currentYearNum.toString());
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI state
  const [validationError, setValidationError] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fintrust_financial_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.totalMonthlyExpenses !== undefined) {
          setMonthlyExpenses(parsed.totalMonthlyExpenses.toString());
        }
        if (parsed.totalMonthlySavings !== undefined) {
          setMonthlySavings(parsed.totalMonthlySavings.toString());
        }
      }
    } catch (e) {
      console.error("Failed to parse local financial data", e);
    }
  }, []);

  const steps = [
    'Parsing transaction records...',
    'Analyzing saving-to-income liquidity buffer...',
    'Validating UPI digital transaction velocities...',
    'Consulting Gemini AI underwriting models...',
    'Formulating credit recommendations...'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const income = parseFloat(monthlyIncome);
    const expenses = parseFloat(monthlyExpenses);
    const savings = parseFloat(monthlySavings);
    const upi = parseInt(upiTransactionFrequency);
    const loans = existingLoans ? parseFloat(existingLoans) : 0;

    // Validation
    if (isNaN(income) || income <= 0) {
      setValidationError('Monthly Income must be a positive number.');
      return;
    }
    if (isNaN(expenses) || expenses < 0) {
      setValidationError('Monthly Expenses must be a positive number.');
      return;
    }
    if (isNaN(savings) || savings < 0) {
      setValidationError('Monthly Savings must be a positive number.');
      return;
    }
    if (isNaN(upi) || upi < 0) {
      setValidationError('UPI Transaction Frequency must be a positive number.');
      return;
    }
    if (existingLoans && (isNaN(loans) || loans < 0)) {
      setValidationError('Existing Loans must be a positive number.');
      return;
    }

    if (expenses + savings > income * 1.5) {
      setValidationError('The sum of monthly expenses and savings exceeds 150% of your reported income. Please verify inputs.');
      return;
    }

    // Trigger AI Assessment Loading Sequence
    setIsAssessing(true);
    setAssessmentStep(0);

    const stepInterval = setInterval(() => {
      setAssessmentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 900);

    try {
      const response = await fetch('http://localhost:8080/api/credit/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          monthlyIncome: income,
          monthlyExpenses: expenses,
          monthlySavings: savings,
          utilityBillConsistency,
          upiTransactionFrequency: upi,
          employmentType,
          occupation,
          existingLoans: loans,
          month,
          year: parseInt(year),
          age: parseInt(age) || 27,
          city: city || 'Mumbai',
          phoneNumber: phoneNumber || '+91-9876543210'
        })
      });

      if (response.status === 403 || response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Server error while generating credit score.');
      }

      // Keep showing assessment animation for a brief moment then push to dashboard
      setTimeout(() => {
        clearInterval(stepInterval);
        setIsAssessing(false);
        navigate('/dashboard');
      }, 5000);

    } catch (err) {
      clearInterval(stepInterval);
      setIsAssessing(false);
      setValidationError(err.message || 'Failed to submit credit data. Check connection.');
    }
  };

  if (isAssessing) {
    return (
      <div className="min-h-screen bg-[#010308] flex flex-col justify-center items-center px-6 relative">
        <PremiumBackground />
        <div className="w-full max-w-md glass-card rounded-2xl p-8 border-white/10 text-center space-y-8 relative z-10">
          <div className="flex flex-col items-center">
            {/* Sparkle Loader */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="h-12 w-12 rounded-full border-4 border-white/5 border-t-[#59CFFF] flex items-center justify-center mb-6"
            >
              <Sparkles className="h-5 w-5 text-[#59CFFF] animate-pulse" />
            </motion.div>
            
            <h2 className="text-xl font-bold text-white mb-2">Analyzing Alternative Profile</h2>
            <p className="text-white/40 text-xs">FinTrust AI is generating your explainable scoring ledger...</p>
          </div>

          {/* Skeleton Loaders */}
          <div className="space-y-3 py-2 text-left">
            <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
          </div>

          {/* Progress Logs */}
          <div className="bg-[#030E21]/50 rounded-xl p-4.5 border border-white/5 text-left font-mono text-[10px] text-[#59CFFF] space-y-3">
            {steps.slice(0, assessmentStep + 1).map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
            {assessmentStep < steps.length - 1 && (
              <div className="flex items-center gap-2 text-white/30 animate-pulse">
                <span className="h-1 w-1 rounded-full bg-white/50 animate-ping" />
                <span>{steps[assessmentStep + 1]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010308] text-white relative">
      <PremiumBackground />

      {/* Navigation Header */}
      <header className="border-b border-white/5 bg-[#030E21]/30 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#59CFFF] to-[#102C57] flex items-center justify-center border border-white/10">
              <ClipboardList className="h-4.5 w-4.5 text-[#59CFFF]" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              FinTrust<span className="text-[#59CFFF] font-light">AI</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel Assessment
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 relative z-10">
        <div className="mb-8 text-left">
          <h1 className="text-2xl font-extrabold text-white mb-2">Alternative Credit Assessment</h1>
          <p className="text-white/40 text-xs leading-relaxed">
            Please enter your behavioral financial profile details below. All fields feed into our deterministic underwriting algorithm to generate a representative rating.
          </p>
        </div>

        {validationError && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#D1495B]/10 border border-[#D1495B]/20 text-[#D1495B] text-xs text-left">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 md:p-8 rounded-2xl border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Income */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-[#59CFFF]" /> Monthly Income (₹)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 45000"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
                min="1"
              />
            </div>

            {/* Assessment Month */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                Assessment Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass-input text-xs bg-[#030E21] appearance-none cursor-pointer"
              >
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Assessment Year */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                Assessment Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass-input text-xs bg-[#030E21] appearance-none cursor-pointer"
              >
                {["2024", "2025", "2026", "2027"].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Expenses */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-[#59CFFF]" /> Monthly Expenses (₹)
              </label>
              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
                min="0"
              />
            </div>

            {/* Savings */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5 text-[#59CFFF]" /> Monthly Savings (₹)
              </label>
              <input
                type="number"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
                min="0"
              />
            </div>

            {/* UPI Velocity */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#59CFFF]" /> UPI Transaction Frequency
              </label>
              <input
                type="number"
                value={upiTransactionFrequency}
                onChange={(e) => setUpiTransactionFrequency(e.target.value)}
                placeholder="Transactions per month (e.g. 35)"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
                min="0"
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-[#59CFFF]" /> Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass-input text-xs bg-[#030E21] appearance-none cursor-pointer"
              >
                <option value="SALARIED">Salaried (Full-time Contract)</option>
                <option value="SELF_EMPLOYED">Self-Employed (Freelance / Shopkeeper)</option>
                <option value="STUDENT">Student Baseline</option>
                <option value="UNEMPLOYED">Unemployed</option>
              </select>
            </div>

            {/* Occupation */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#59CFFF]" /> Occupation / Job Role
              </label>
              <input
                 type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer, Shopkeeper"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 27"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
                min="18"
                max="120"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New Delhi"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                required
              />
            </div>

            {/* Utility consistency */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-[#59CFFF]" /> Payment Consistency Fallback
              </label>
              <select
                value={utilityBillConsistency}
                onChange={(e) => setUtilityBillConsistency(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass-input text-xs bg-[#030E21] appearance-none cursor-pointer"
              >
                <option value="CONSISTENT">100% Consistent (Paid on time)</option>
                <option value="SEMI_CONSISTENT">Semi-Consistent (Occasional delay)</option>
                <option value="INCONSISTENT">Inconsistent (Missed / recurrent delays)</option>
              </select>
            </div>

            {/* Existing loans */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-[#59CFFF]" /> Active Loans Outstanding (Optional)
              </label>
              <input
                type="number"
                value={existingLoans}
                onChange={(e) => setExistingLoans(e.target.value)}
                placeholder="Omit or enter 0 if none"
                className="w-full px-4 py-3 rounded-lg glass-input text-xs"
                min="0"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl btn-glow-sky text-xs font-bold mt-4 transition-all"
          >
            Compute AI Credit Assessment
          </button>
        </form>
      </main>
    </div>
  );
}
