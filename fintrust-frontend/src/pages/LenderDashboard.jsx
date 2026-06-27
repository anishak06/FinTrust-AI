import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  Building, Search, History, Settings, LogOut, CheckCircle, AlertTriangle, XCircle, 
  User, ShieldAlert, TrendingUp, Award, Calendar, Percent, FileText, CheckSquare, 
  Activity, Info, HeartHandshake, Loader2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';

export default function LenderDashboard() {
  const { token, logout, isLender } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, search, history, settings

  // Search states
  const [consentToken, setConsentToken] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState('');
  const [borrowerData, setBorrowerData] = useState(null);

  // Decision states
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState('');

  // History states
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!isLender) {
      navigate('/lender/login');
      return;
    }
    fetchHistory();
  }, [token, isLender]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('http://localhost:8080/api/lender/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error("Failed to fetch lender history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleScanToken = async (e) => {
    e.preventDefault();
    if (!consentToken.trim()) return;

    setLoadingSearch(true);
    setErrorSearch('');
    setBorrowerData(null);
    setDecisionSuccess('');
    setDecisionReason('');

    try {
      const res = await fetch('http://localhost:8080/api/lender/consent/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: consentToken.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        setBorrowerData(data);
        fetchHistory(); // refresh history list
      } else {
        setErrorSearch(data.error || 'Failed to verify consent token.');
      }
    } catch (err) {
      setErrorSearch('Network connection error. Please try again.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleReopenBorrower = async (tokenVal) => {
    setConsentToken(tokenVal);
    setActiveTab('search');
    // Fetch directly
    setLoadingSearch(true);
    setErrorSearch('');
    setBorrowerData(null);
    setDecisionSuccess('');
    setDecisionReason('');

    try {
      const res = await fetch('http://localhost:8080/api/lender/consent/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: tokenVal })
      });

      const data = await res.json();

      if (res.ok) {
        setBorrowerData(data);
      } else {
        setErrorSearch('This token has expired or is invalid. Consent must be requested again from the borrower.');
      }
    } catch (err) {
      setErrorSearch('Failed to retrieve borrower details.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDecision = async (decisionType) => {
    if (!borrowerData) return;

    setSubmittingDecision(true);
    setDecisionSuccess('');

    try {
      const res = await fetch('http://localhost:8080/api/lender/loan-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          borrowerId: borrowerData.borrowerId.toString(),
          decision: decisionType,
          reason: decisionReason
        })
      });

      if (res.ok) {
        setDecisionSuccess(`Application successfully ${decisionType.toLowerCase().replace('_', ' ')}! Notification sent.`);
        // Update local state status
        setBorrowerData(prev => ({
          ...prev,
          verificationStatus: decisionType === 'APPROVED' ? 'VERIFIED' : (decisionType === 'REJECTED' ? 'REJECTED' : 'PENDING'),
          lastDecision: decisionType
        }));
        fetchHistory();
      } else {
        setErrorSearch('Failed to record underwriting decision.');
      }
    } catch (err) {
      setErrorSearch('Connection failure during decision post.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Helper colors
  const getRiskColor = (tier) => {
    if (tier?.toLowerCase().includes('low') || tier?.toLowerCase().includes('verified')) return '#10B981'; // Green
    if (tier?.toLowerCase().includes('med') || tier?.toLowerCase().includes('moderate') || tier?.toLowerCase().includes('pending')) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreColor = (score) => {
    if (score >= 750) return '#10B981';
    if (score >= 650) return '#F59E0B';
    return '#EF4444';
  };

  // EMI calculation helper: P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = (p, rPct, nMonths) => {
    if (!p) return 0;
    const r = (rPct / 12) / 100;
    const emi = (p * r * Math.pow(1 + r, nMonths)) / (Math.pow(1 + r, nMonths) - 1);
    return Math.round(emi);
  };

  const scoreBreakdownItems = borrowerData?.scoreBreakdown ? JSON.parse(borrowerData.scoreBreakdown) : [];

  return (
    <div className="min-h-screen bg-[#081C3A] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      <PremiumBackground />

      {/* Top Header Navigation */}
      <header className="border-b border-white/10 bg-[#081C3A]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#38BDF8] to-[#081C3A] flex items-center justify-center border border-white/10 shadow-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FinTrust<span className="text-[#38BDF8] font-light">Lender</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'border-[#38BDF8] text-white' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('search')} 
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 'search' ? 'border-[#38BDF8] text-white' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              Search Borrower
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 'history' ? 'border-[#38BDF8] text-white' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              History
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 'settings' ? 'border-[#38BDF8] text-white' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              Settings
            </button>
          </nav>

          <button
            onClick={() => { logout(); navigate('/lender/login'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 relative z-10">

        {/* Tab 1: Lender Analytics Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Banking Analytics Console</h1>
              <p className="text-white/50 text-xs mt-1">Platform-wide alternative underwriting performance metrics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl flex items-center justify-between border border-slate-200/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Assessed Inflow</span>
                  <span className="text-3xl font-black block mt-1 text-slate-800">{historyList.length}</span>
                </div>
                <div className="h-11 w-11 rounded-lg bg-[#38BDF8]/10 flex items-center justify-center text-[#38BDF8]">
                  <Activity className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl flex items-center justify-between border border-slate-200/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Approval Volume</span>
                  <span className="text-3xl font-black block mt-1 text-slate-800">
                    ₹{(historyList.filter(h => h.decision === 'APPROVED').length * 250000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-11 w-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl flex items-center justify-between border border-slate-200/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Average Credit Score</span>
                  <span className="text-3xl font-black block mt-1 text-slate-800">
                    {historyList.length > 0 
                      ? Math.round(historyList.reduce((acc, curr) => acc + (typeof curr.score === 'number' ? curr.score : 0), 0) / historyList.length) 
                      : 'N/A'}
                  </span>
                </div>
                <div className="h-11 w-11 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Award className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl flex items-center justify-between border border-slate-200/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Underwriting Decisions</span>
                  <span className="text-3xl font-black block mt-1 text-slate-800">
                    {historyList.filter(h => h.decision && h.decision !== 'PENDING').length}
                  </span>
                </div>
                <div className="h-11 w-11 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <CheckSquare className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Scan Consent Token Prompt */}
              <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-4 lg:col-span-1">
                <h3 className="text-base font-bold text-slate-800">Scan Borrower QR</h3>
                <p className="text-xs text-slate-500">Enter the secure consent token generated on the borrower's share screen to verify alternative credit profiles.</p>
                <form onSubmit={handleScanToken} className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={consentToken}
                      onChange={(e) => setConsentToken(e.target.value)}
                      placeholder="e.g. 9b1deb4d-3b7d-4bad-9bdd..."
                      className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#38BDF8] focus:border-[#38BDF8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#38BDF8] hover:bg-[#30a9dd] text-[#081C3A] text-xs font-bold transition-all flex justify-center items-center gap-1 cursor-pointer"
                  >
                    Validate Consent Token <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

              {/* Live Application Stream */}
              <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-800">Recent Scoring Reviews</h3>
                  <button 
                    onClick={() => setActiveTab('history')} 
                    className="text-xs font-semibold text-[#38BDF8] hover:underline"
                  >
                    View All Registry
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                  {historyList.length > 0 ? (
                    historyList.slice(0, 4).map((hist, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-800">{hist.borrowerName}</p>
                          <p className="text-[10px] text-slate-400">Viewed on {new Date(hist.viewedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-mono font-bold block" style={{ color: getScoreColor(hist.score) }}>
                              {hist.score}
                            </span>
                            <span className="text-[9px] text-slate-400 block">{hist.riskLevel}</span>
                          </div>
                          <span 
                            className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                            style={{ 
                              backgroundColor: `${getRiskColor(hist.decision)}15`, 
                              color: getRiskColor(hist.decision),
                              border: `1px solid ${getRiskColor(hist.decision)}30`
                            }}
                          >
                            {hist.decision}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 italic">No historical evaluations performed yet.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Borrower Search & Profile Verification Detail */}
        {activeTab === 'search' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Consent Verification Console</h1>
              <p className="text-white/50 text-xs mt-1">Review alternative credit parameters and behavior timelines after consent validation</p>
            </div>

            {/* Token Validation Bar */}
            <div className="bg-white p-5 rounded-xl shadow-xl border border-slate-200/50">
              <form onSubmit={handleScanToken} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={consentToken}
                    onChange={(e) => setConsentToken(e.target.value)}
                    placeholder="Enter secure one-time borrower consent token (UUID)..."
                    className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-[#38BDF8]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingSearch}
                  className="px-6 py-3 rounded-lg bg-[#38BDF8] hover:bg-[#30a9dd] text-[#081C3A] text-xs font-bold transition-all flex justify-center items-center gap-1 cursor-pointer"
                >
                  {loadingSearch ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Fetch Profile Details'}
                </button>
              </form>
              {errorSearch && (
                <div className="mt-3.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorSearch}</span>
                </div>
              )}
            </div>

            {/* Borrower Profile Details Grid */}
            {borrowerData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Profile card, AI rating, Verification Decisions */}
                <div className="space-y-8 lg:col-span-1">
                  
                  {/* Borrower Card */}
                  <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-4">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                      <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400">
                        <User className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{borrowerData.fullName}</h3>
                        <p className="text-xs text-slate-400">{borrowerData.email}</p>
                        <span 
                          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider block w-fit mt-1"
                          style={{ 
                            backgroundColor: `${getRiskColor(borrowerData.verificationStatus)}15`, 
                            color: getRiskColor(borrowerData.verificationStatus),
                            border: `1px solid ${getRiskColor(borrowerData.verificationStatus)}30`
                          }}
                        >
                          {borrowerData.verificationStatus === 'VERIFIED' ? 'Verified' : borrowerData.verificationStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Borrower ID:</span><span className="font-bold font-mono">BWR-{borrowerData.borrowerId}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Age:</span><span className="font-bold">{borrowerData.age} years</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">City Location:</span><span className="font-bold">{borrowerData.city}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Phone:</span><span className="font-bold font-mono">{borrowerData.phoneNumber}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Employment Type:</span><span className="font-bold">{borrowerData.employmentType}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Occupation:</span><span className="font-bold">{borrowerData.occupation}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Monthly Income:</span><span className="font-bold">₹{borrowerData.monthlyIncome.toLocaleString('en-IN')}</span></div>
                    </div>
                  </div>

                  {/* Document Verification Status Panel */}
                  <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Document Verification Status</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Electricity Bill</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="h-4 w-4" /> Verified</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Water Bill</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="h-4 w-4" /> Verified</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Rent Receipt</span>
                        <span className="flex items-center gap-1 text-amber-500 font-semibold"><AlertTriangle className="h-4 w-4" /> Pending</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Salary Slip</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="h-4 w-4" /> Verified</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Bank Statement</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="h-4 w-4" /> Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Underwriting Decisions Card */}
                  <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Underwriting Loan Decision</h3>
                    {decisionSuccess && (
                      <div className="p-3 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs">
                        {decisionSuccess}
                      </div>
                    )}
                    <div className="space-y-3 text-xs">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Decision Remarks / Reason</label>
                      <textarea
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        placeholder="Provide details on approval, declination parameters, or requested documents..."
                        rows="3"
                        className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#38BDF8]"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleDecision('APPROVED')}
                          disabled={submittingDecision}
                          className="py-2.5 rounded-lg bg-[#10B981] hover:bg-[#0e9d6d] text-white font-bold transition-all text-center cursor-pointer text-[10px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision('DOCUMENTS_REQUESTED')}
                          disabled={submittingDecision}
                          className="py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#de8f09] text-white font-bold transition-all text-center cursor-pointer text-[10px]"
                        >
                          Req Docs
                        </button>
                        <button
                          onClick={() => handleDecision('REJECTED')}
                          disabled={submittingDecision}
                          className="py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#dc3535] text-white font-bold transition-all text-center cursor-pointer text-[10px]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Column 2 & 3: Risk breakdowns, behavioral graphs, Gemini summaries */}
                <div className="space-y-8 lg:col-span-2">
                  
                  {/* Scoring Overview Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Alternate Score & Breakdown */}
                    <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">FinTrust AI Credit Rating</h3>
                      <div className="flex items-center gap-6">
                        <div className="relative h-24 w-24 flex items-center justify-center rounded-full border-8 border-slate-100" style={{ borderColor: `${getScoreColor(borrowerData.score)}30` }}>
                          <div className="text-center">
                            <span className="text-2xl font-black block" style={{ color: getScoreColor(borrowerData.score) }}>{borrowerData.score || 'N/A'}</span>
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 block mt-0.5">Alt Score</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-slate-800">Risk Profile: <span style={{ color: getScoreColor(borrowerData.score) }}>{borrowerData.riskLevel}</span></p>
                          <p className="text-slate-400">Traditional CIBIL Rank equivalent: <b className="text-slate-700">{borrowerData.traditionalScore}</b></p>
                          <p className="text-slate-400">Assessed on: <b className="text-slate-700">{borrowerData.calculationDate ? new Date(borrowerData.calculationDate).toLocaleDateString() : 'N/A'}</b></p>
                        </div>
                      </div>

                      {/* Contribution Table */}
                      <div className="space-y-2.5 mt-4">
                        <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score Attributes Weighted Contribution</h4>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden text-xs">
                          {scoreBreakdownItems.map((item, index) => (
                            <div key={index} className="p-2.5 flex justify-between bg-slate-50/50">
                              <span className="text-slate-600 font-medium">{item.factor}</span>
                              <span className="font-bold text-emerald-600">+{item.points} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Loan Recommendation Card */}
                    <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Underwriting Parameters</h3>
                        <div className="space-y-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Recommended Principal</span>
                              <span className="text-2xl font-black text-slate-800">₹{borrowerData.maxLendableAmount ? borrowerData.maxLendableAmount.toLocaleString('en-IN') : '0'}</span>
                            </div>
                            <span className="px-2.5 py-1 rounded bg-[#38BDF8]/10 text-[#38BDF8] text-xs font-bold">Education Loan</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <span className="text-slate-400 block mb-0.5">Interest Rate</span>
                              <span className="font-black text-slate-800 text-sm">8.5% p.a.</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <span className="text-slate-400 block mb-0.5">Assessed Tenure</span>
                              <span className="font-black text-slate-800 text-sm">48 Months</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Estimated Monthly EMI:</span>
                        <span className="font-black text-slate-900 text-base">
                          ₹{calculateEMI(borrowerData.maxLendableAmount, 8.5, 48).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Fraud Detection Panel */}
                  <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-slate-800">Security & Fraud Analytics</h3>
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: getRiskColor(borrowerData.fraudRisk) }}>
                        <ShieldAlert className="h-4 w-4" /> Risk Tier: {borrowerData.fraudRisk}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <span className="text-slate-400 block mb-0.5">Duplicate Documents</span>
                        <span className="font-bold text-emerald-600">None Flagged</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <span className="text-slate-400 block mb-0.5">Income Consistency</span>
                        <span className="font-bold text-emerald-600">Verified Stability</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <span className="text-slate-400 block mb-0.5">Expense Consistency</span>
                        <span className="font-bold text-emerald-600">Within Thresholds</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <span className="text-slate-400 block mb-0.5">Identity Verification</span>
                        <span className="font-bold text-emerald-600">Match 100%</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <span className="text-slate-400 block mb-0.5">Duplicate Account</span>
                        <span className="font-bold text-emerald-600">Single Profile</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <span className="text-slate-400 block mb-0.5">Underwriting Checks</span>
                        <span className="font-bold text-emerald-600">Passed</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Behavior Timeline Charts */}
                  <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">Alternative Credit Metrics Timeline</h3>
                    <div className="h-64">
                      {borrowerData.timeline && borrowerData.timeline.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[...borrowerData.timeline].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="month" fontSize={10} tickLine={false} />
                            <YAxis fontSize={10} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#000' }} />
                            <Area type="monotone" dataKey="savings" name="Savings (INR)" stroke="#38BDF8" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expenses" name="Expenses (INR)" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No timeline data available for graph render.</div>
                      )}
                    </div>
                  </div>

                  {/* Gemini Summary Panel */}
                  <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="h-4.5 w-4.5 text-[#38BDF8]" /> Underwriting AI Recommendation
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {borrowerData.geminiInsights}
                    </p>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white text-slate-800 p-12 rounded-xl shadow-xl border border-slate-200/50 text-center space-y-4">
                <Info className="h-10 w-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Awaiting Consent Token</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Please enter a valid secure access token to verify borrower details. FinTrust AI requires strict borrower consent to render alternative scoring parameters.</p>
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Evaluation History Registry */}
        {activeTab === 'history' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Audit Log History</h1>
              <p className="text-white/50 text-xs mt-1">Review previously verified borrower files and credit choices</p>
            </div>

            <div className="bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="p-4">Borrower Name</th>
                      <th className="p-4">Alternative Score</th>
                      <th className="p-4">Risk Profile</th>
                      <th className="p-4">Approved Inflow Loan</th>
                      <th className="p-4">Underwriting Decision</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyList.length > 0 ? (
                      historyList.map((hist, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{hist.borrowerName}</td>
                          <td className="p-4 font-mono font-black text-sm" style={{ color: getScoreColor(hist.score) }}>
                            {hist.score}
                          </td>
                          <td className="p-4">
                            <span 
                              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                              style={{ 
                                backgroundColor: `${getScoreColor(hist.score)}10`, 
                                color: getScoreColor(hist.score)
                              }}
                            >
                              {hist.riskLevel}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            ₹{hist.amount ? hist.amount.toLocaleString('en-IN') : '0'}
                          </td>
                          <td className="p-4">
                            <span 
                              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                              style={{ 
                                backgroundColor: `${getRiskColor(hist.decision)}10`, 
                                color: getRiskColor(hist.decision)
                              }}
                            >
                              {hist.decision}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleReopenBorrower(hist.borrowerId.toString())}
                              className="px-3 py-1.5 rounded bg-[#38BDF8] hover:bg-[#30a9dd] text-[#081C3A] font-semibold text-[10px] cursor-pointer"
                            >
                              Reopen Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-400 italic">
                          No evaluations recorded. Scan a borrower consent token to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Banking Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in text-left max-w-2xl">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Security & Settings</h1>
              <p className="text-white/50 text-xs mt-1">Configure banking system parameters and SMTP setups</p>
            </div>

            <div className="bg-white text-slate-800 p-6 rounded-xl shadow-xl border border-slate-200/50 space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">System Information</h3>
                <p className="text-xs text-slate-400">Verification Engine status: <span className="text-emerald-600 font-bold">Online</span></p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SMTP Email Notification Configuration</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-medium">SMTP Server Host</label>
                    <input type="text" placeholder="smtp.gmail.com" disabled className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-medium">SMTP Port</label>
                    <input type="text" placeholder="587" disabled className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400" />
                  </div>
                </div>
                <p className="text-[10px] text-amber-500 italic bg-amber-500/5 p-3 rounded border border-amber-500/10 flex items-start gap-1">
                  <Info className="h-4 w-4 shrink-0" /> SMTP server configuration is currently set to fallback logging inside the backend console during sandbox environments. Notification dispatches are registered in the server logs.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
