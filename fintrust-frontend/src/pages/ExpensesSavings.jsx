import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ArrowLeft, ArrowRight, Trash2, Plus, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpensesSavings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load initial data from localStorage if exists
  const loadInitialData = (key, defaultTitle) => {
    try {
      const stored = localStorage.getItem('fintrust_financial_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[key] && parsed[key].length > 0) {
          return parsed[key];
        }
      }
    } catch (e) {
      console.error("Failed to load local data");
    }
    return [{ id: Date.now().toString(), title: defaultTitle, amount: '' }];
  };

  const [expenses, setExpenses] = useState(() => loadInitialData('monthlyExpenses', 'Electricity Bill'));
  const [savings, setSavings] = useState(() => loadInitialData('monthlySavings', 'Mutual Fund'));
  const [validationError, setValidationError] = useState('');

  // Real-time totals
  const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalSavings = savings.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleAddExpense = () => {
    setExpenses([...expenses, { id: Date.now().toString(), title: '', amount: '' }]);
  };

  const handleRemoveExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAddSaving = () => {
    setSavings([...savings, { id: Date.now().toString(), title: '', amount: '' }]);
  };

  const handleRemoveSaving = (id) => {
    setSavings(savings.filter(s => s.id !== id));
  };

  const handleSavingChange = (id, field, value) => {
    setSavings(savings.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const validate = () => {
    for (const expense of expenses) {
      if (!expense.title.trim()) return "Expense title cannot be empty.";
      const amt = parseFloat(expense.amount);
      if (isNaN(amt) || amt < 0) return `Invalid amount for expense: ${expense.title || 'Untitled'}`;
    }
    for (const saving of savings) {
      if (!saving.title.trim()) return "Saving title cannot be empty.";
      const amt = parseFloat(saving.amount);
      if (isNaN(amt) || amt < 0) return `Invalid amount for saving: ${saving.title || 'Untitled'}`;
    }
    
    // Check for empty arrays
    const cleanExpenses = expenses.filter(e => e.title.trim() && parseFloat(e.amount) >= 0);
    const cleanSavings = savings.filter(s => s.title.trim() && parseFloat(s.amount) >= 0);
    
    if (cleanExpenses.length === 0 && cleanSavings.length === 0) {
      return "Please add at least one valid expense or saving to continue.";
    }

    return "";
  };

  const handleContinue = () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    // Filter out completely empty rows just in case, though validation catches them
    const cleanExpenses = expenses
      .filter(e => e.title.trim() && !isNaN(parseFloat(e.amount)))
      .map(e => ({ title: e.title.trim(), amount: parseFloat(e.amount) }));
      
    const cleanSavings = savings
      .filter(s => s.title.trim() && !isNaN(parseFloat(s.amount)))
      .map(s => ({ title: s.title.trim(), amount: parseFloat(s.amount) }));

    const payload = {
      monthlyExpenses: cleanExpenses,
      totalMonthlyExpenses: cleanExpenses.reduce((sum, item) => sum + item.amount, 0),
      monthlySavings: cleanSavings,
      totalMonthlySavings: cleanSavings.reduce((sum, item) => sum + item.amount, 0)
    };

    localStorage.setItem('fintrust_financial_data', JSON.stringify(payload));
    navigate('/check-eligibility');
  };

  return (
    <div className="min-h-screen bg-[#010308] text-white flex flex-col relative">
      <PremiumBackground />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#030E21]/30 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#59CFFF] to-[#102C57] flex items-center justify-center border border-white/10">
              <Cpu className="h-4.5 w-4.5 text-[#59CFFF]" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              FinTrust<span className="text-[#59CFFF] font-light">AI</span>
            </span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-6 py-10 space-y-8 relative z-10 text-left flex flex-col">
        
        {/* Title & Description */}
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Monthly Expenses & Savings</h1>
            <p className="text-white/40 text-xs mt-1 max-w-xl">
              Build your live financial summary manually. This data securely feeds into our deterministic underwriting algorithm to generate your representative rating. No uploaded documents required.
            </p>
          </div>
          
          <button
            onClick={handleContinue}
            className="btn-glow-sky px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
          >
            Continue to Assessment <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>

        {validationError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-[#D1495B]/10 border border-[#D1495B]/20 text-[#D1495B] text-sm flex gap-3 items-center font-medium">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{validationError}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
          
          {/* Left Panel: Expenses */}
          <div className="glass-card p-6 rounded-2xl border-white/10 flex flex-col h-full shadow-2xl shadow-[#59CFFF]/5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#D1495B]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Monthly Expenses</h2>
                <p className="text-[10px] text-white/40 uppercase font-semibold">Track all cash outflows</p>
              </div>
            </div>

            {/* Expenses List */}
            <div className="flex-grow space-y-3 mb-6 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {expenses.map((expense) => (
                  <motion.div 
                    key={expense.id} 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-grow relative">
                      <input
                        type="text"
                        placeholder="e.g. Electricity Bill, Rent"
                        value={expense.title}
                        onChange={(e) => {
                          setValidationError('');
                          handleExpenseChange(expense.id, 'title', e.target.value);
                        }}
                        className="w-full px-4 py-2.5 rounded-lg glass-input text-xs font-medium placeholder-white/20"
                      />
                    </div>
                    <div className="w-32 relative">
                      <span className="absolute left-3 top-2.5 text-white/30 text-xs font-semibold">₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={expense.amount}
                        onChange={(e) => {
                          setValidationError('');
                          handleExpenseChange(expense.id, 'amount', e.target.value);
                        }}
                        className="w-full pl-7 pr-3 py-2.5 rounded-lg glass-input text-xs font-bold text-white font-mono placeholder-white/20"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all mt-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <button
                onClick={handleAddExpense}
                className="w-full py-3.5 mt-2 rounded-xl border border-dashed border-white/10 text-white/50 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="h-4 w-4" /> Add Expense
              </button>
            </div>

            {/* Expense Summary */}
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="bg-[#D1495B]/10 border border-[#D1495B]/20 rounded-xl p-5 flex justify-between items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#D1495B]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#D1495B] tracking-wider">Total Monthly Expenses</h3>
                  <p className="text-[10px] text-white/40 font-medium">Automatically calculated</p>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1 z-10">
                  <span className="text-white/40 text-lg">₹</span>
                  {totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Savings */}
          <div className="glass-card p-6 rounded-2xl border-white/10 flex flex-col h-full shadow-2xl shadow-emerald-500/5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#34C759]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Monthly Savings & Investments</h2>
                <p className="text-[10px] text-white/40 uppercase font-semibold">Track liquid assets and buffers</p>
              </div>
            </div>

            {/* Savings List */}
            <div className="flex-grow space-y-3 mb-6 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {savings.map((saving) => (
                  <motion.div 
                    key={saving.id} 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-grow relative">
                      <input
                        type="text"
                        placeholder="e.g. Fixed Deposit, Mutual Fund"
                        value={saving.title}
                        onChange={(e) => {
                          setValidationError('');
                          handleSavingChange(saving.id, 'title', e.target.value);
                        }}
                        className="w-full px-4 py-2.5 rounded-lg glass-input text-xs font-medium placeholder-white/20"
                      />
                    </div>
                    <div className="w-32 relative">
                      <span className="absolute left-3 top-2.5 text-white/30 text-xs font-semibold">₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={saving.amount}
                        onChange={(e) => {
                          setValidationError('');
                          handleSavingChange(saving.id, 'amount', e.target.value);
                        }}
                        className="w-full pl-7 pr-3 py-2.5 rounded-lg glass-input text-xs font-bold text-white font-mono placeholder-white/20"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveSaving(saving.id)}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all mt-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <button
                onClick={handleAddSaving}
                className="w-full py-3.5 mt-2 rounded-xl border border-dashed border-white/10 text-white/50 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="h-4 w-4" /> Add Saving
              </button>
            </div>

            {/* Savings Summary */}
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex justify-between items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#34C759] tracking-wider">Total Monthly Savings</h3>
                  <p className="text-[10px] text-white/40 font-medium">Automatically calculated</p>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1 z-10">
                  <span className="text-white/40 text-lg">₹</span>
                  {totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
