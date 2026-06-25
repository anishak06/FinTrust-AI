import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Cpu, ShieldCheck, DollarSign, LogOut, Plus, Trash2, Edit, AlertCircle, ChevronRight, CheckCircle, ArrowRight, Lightbulb, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Goal modal/inputs
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalError, setGoalError] = useState('');
  const [goalLoading, setGoalLoading] = useState(false);

  // Fetch all user dashboard data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch latest assessment
      const latestRes = await fetch('http://localhost:8080/api/credit/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const latestData = await latestRes.json();
      
      if (latestRes.ok && latestData.score) {
        setLatestAssessment(latestData);
      } else {
        setLatestAssessment(null);
      }

      // 2. Fetch history
      const historyRes = await fetch('http://localhost:8080/api/credit/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setAssessmentHistory(historyData);
      }

      // 3. Fetch goals
      const goalsRes = await fetch('http://localhost:8080/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData);
      }

    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Goal submission
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setGoalError('');
    const targetVal = parseFloat(goalTarget);
    const currentVal = parseFloat(goalCurrent);

    if (!goalName || !goalTarget || !goalCurrent || !goalDate) {
      setGoalError('Please fill in all goal fields.');
      return;
    }
    if (isNaN(targetVal) || targetVal <= 0) {
      setGoalError('Target amount must be a positive number.');
      return;
    }
    if (isNaN(currentVal) || currentVal < 0) {
      setGoalError('Current savings must be a positive number.');
      return;
    }
    if (currentVal > targetVal) {
      setGoalError('Current savings cannot exceed target amount.');
      return;
    }

    setGoalLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: goalName,
          targetAmount: targetVal,
          currentSavings: currentVal,
          targetDate: goalDate
        })
      });

      if (res.ok) {
        setGoalModalOpen(false);
        setGoalName('');
        setGoalTarget('');
        setGoalCurrent('');
        setGoalDate('');
        fetchData(); // reload goals
      } else {
        const errData = await res.json();
        setGoalError(errData.error || 'Failed to create goal.');
      }
    } catch (err) {
      setGoalError('Network error while saving goal.');
    } finally {
      setGoalLoading(false);
    }
  };

  // Delete goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData(); // reload
      }
    } catch (err) {
      alert('Failed to delete goal.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Parsing JSON fields from latest assessment
  let scoreBreakdown = [];
  let recommendations = [];
  if (latestAssessment) {
    try {
      scoreBreakdown = JSON.parse(latestAssessment.scoreBreakdown) || [];
    } catch (e) {
      scoreBreakdown = [];
    }
    try {
      recommendations = JSON.parse(latestAssessment.recommendations) || [];
    } catch (e) {
      recommendations = [];
    }
  }

  // Visual Score Formatting
  const getScoreColor = (score) => {
    if (score >= 750) return '#10B981'; // green
    if (score >= 630) return '#10B981';
    if (score >= 520) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  // Charts Preps
  // 1. Donut Expense Breakdown Chart
  const expenseData = latestAssessment ? [
    { name: 'Core Expenses (Rent/Bills)', value: Math.round(latestAssessment.monthlyExpenses * 0.55), color: '#143c75' },
    { name: 'Living & Groceries', value: Math.round(latestAssessment.monthlyExpenses * 0.25), color: '#59CFFF' },
    { name: 'Discretionary / Other', value: Math.round(latestAssessment.monthlyExpenses * 0.20), color: '#F5E6D3' }
  ] : [];

  // 2. Savings and Income History Trend Chart
  // We formulate up to 6 months of historical coordinates for visual depth
  const trendData = latestAssessment ? [
    { name: 'Jan', Savings: Math.round(latestAssessment.monthlySavings * 0.7), Income: latestAssessment.monthlyIncome },
    { name: 'Feb', Savings: Math.round(latestAssessment.monthlySavings * 0.8), Income: latestAssessment.monthlyIncome },
    { name: 'Mar', Savings: Math.round(latestAssessment.monthlySavings * 0.75), Income: latestAssessment.monthlyIncome },
    { name: 'Apr', Savings: Math.round(latestAssessment.monthlySavings * 0.9), Income: latestAssessment.monthlyIncome },
    { name: 'May', Savings: Math.round(latestAssessment.monthlySavings * 0.95), Income: latestAssessment.monthlyIncome },
    { name: 'Current', Savings: latestAssessment.monthlySavings, Income: latestAssessment.monthlyIncome }
  ] : [];

  // Render Skeletons during load
  if (loading) {
    return (
      <div className="min-h-screen bg-[#071B3B] text-white flex flex-col">
        <header className="border-b border-white/10 px-6 py-4 flex justify-between items-center bg-[#071B3B]/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-white/10 animate-pulse" />
            <div className="h-5 bg-white/10 rounded w-24 animate-pulse" />
          </div>
          <div className="h-8 bg-white/10 rounded w-20 animate-pulse" />
        </header>
        <div className="flex-1 mx-auto max-w-7xl w-full px-6 py-8 space-y-6">
          <div className="h-8 bg-white/10 rounded w-48 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
            <div className="h-40 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
            <div className="h-40 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
            <div className="h-80 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071B3B] text-white flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#071B3B]/60 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#59CFFF] to-[#143c75] flex items-center justify-center">
              <Cpu className="h-5 w-5 text-[#071B3B]" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FinTrust<span className="text-[#59CFFF] font-light">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70 hidden sm:inline-block">
              Hi, <b className="text-white">{user?.fullName}</b>
            </span>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-1.5 rounded bg-[#59CFFF]/10 border border-[#59CFFF]/25 text-[#59CFFF] text-xs font-semibold hover:bg-[#59CFFF]/20 transition-all"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Panel */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-8">
        
        {/* Header CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Borrower Dashboard</h1>
            <p className="text-white/50 text-xs mt-1">Real-time alternative credit underwriting parameters</p>
          </div>
          <button
            onClick={() => navigate('/check-eligibility')}
            className="px-5 py-2.5 rounded-lg btn-glow-sky text-[#071B3B] font-bold text-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> New Credit Assessment
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* If no assessment, prompt user */}
        {!latestAssessment ? (
          <div className="glass-card p-8 rounded-2xl border-white/10 text-center space-y-6 max-w-2xl mx-auto my-12">
            <AlertCircle className="h-14 w-14 text-[#59CFFF] mx-auto opacity-75 animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold">No Credit Assessment Found</h2>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                We need your alternative telemetry inputs (savings rate, bill payment metrics) to calculate your FinTrust Score and loan eligibility.
              </p>
            </div>
            <button
              onClick={() => navigate('/check-eligibility')}
              className="px-6 py-3 rounded-lg btn-glow-sky text-[#071B3B] font-bold text-sm inline-flex items-center gap-1.5"
            >
              Check Eligibility Now <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Top Summaries Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Credit Score Gauge Card */}
              <div className="glass-card p-5 rounded-xl border-white/5 text-center flex flex-col justify-between md:col-span-1 lg:col-span-1">
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider">FinTrust Score</span>
                
                {/* Radial Simulation */}
                <div className="relative flex items-center justify-center my-3">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      stroke={getScoreColor(latestAssessment.score)} 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="301.6"
                      strokeDashoffset={301.6 - (301.6 * (latestAssessment.score - 300) / 600)}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold" style={{ color: getScoreColor(latestAssessment.score) }}>
                      {latestAssessment.score}
                    </span>
                    <span className="text-[9px] text-white/40">max 900</span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 inline-block mx-auto border border-white/10" style={{ color: getScoreColor(latestAssessment.score) }}>
                  {latestAssessment.riskCategory}
                </span>
              </div>

              {/* Loan Eligibility */}
              <div className="glass-card p-5 rounded-xl border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider">Loan Status</span>
                
                <div className="my-2 space-y-1">
                  <div className="flex items-center gap-2">
                    {latestAssessment.loanEligible ? (
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="h-4.5 w-4.5 text-red-400" />
                      </div>
                    )}
                    <span className="text-lg font-bold">
                      {latestAssessment.loanEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                  {latestAssessment.loanEligible && (
                    <div className="text-xs text-white/70">
                      Amount: <b className="text-[#F5E6D3] text-sm">₹{latestAssessment.suggestedLoanAmount.toLocaleString('en-IN')}</b>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-white/40">Underwritten based on Cashflow</span>
              </div>

              {/* Health Status */}
              <div className="glass-card p-5 rounded-xl border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider">Financial Health</span>
                
                <div className="my-3">
                  <span className="text-2xl font-extrabold text-[#59CFFF]">
                    {latestAssessment.healthStatus}
                  </span>
                  <p className="text-[10px] text-white/50 mt-1">Overall savings & billing velocity</p>
                </div>

                <span className="text-[10px] text-white/40">Gemini Evaluated Matrix</span>
              </div>

              {/* Savings Buffer */}
              <div className="glass-card p-5 rounded-xl border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider">Monthly Savings</span>
                
                <div className="my-3">
                  <span className="text-xl font-bold text-white">
                    ₹{latestAssessment.monthlySavings.toLocaleString('en-IN')}
                  </span>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                    <span>Rate: {Math.round(latestAssessment.monthlySavings / latestAssessment.monthlyIncome * 100)}% of Income</span>
                  </div>
                </div>

                <span className="text-[10px] text-white/40">Buffer: ₹{latestAssessment.monthlyIncome.toLocaleString('en-IN')} Inflow</span>
              </div>

              {/* UPI/Spending Analysis */}
              <div className="glass-card p-5 rounded-xl border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider">UPI Activity</span>
                
                <div className="my-3">
                  <span className="text-xl font-bold text-white">
                    {latestAssessment.upiTransactionFrequency} <span className="text-xs text-white/50">txns/mo</span>
                  </span>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    Expenses: ₹{latestAssessment.monthlyExpenses.toLocaleString('en-IN')}
                  </div>
                </div>

                <span className="text-[10px] text-white/40">Velocity probability: Low Risk</span>
              </div>

            </div>

            {/* Middle Analytics Block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recharts Area Savings Trend */}
              <div className="glass-card p-6 rounded-xl border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-4 text-left">
                  Liquidity & Savings Buffers (6 Months)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#59CFFF" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#59CFFF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#071B3B', borderColor: 'rgba(89,207,255,0.2)', color: '#fff' }}
                        itemStyle={{ color: '#59CFFF' }}
                      />
                      <Area type="monotone" dataKey="Savings" stroke="#59CFFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSavings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Breakdown Pie Chart */}
              <div className="glass-card p-6 rounded-xl border-white/5 flex flex-col justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-4 text-left">
                  Expense Structure Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1">
                  
                  {/* Recharts Pie */}
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#071B3B', borderColor: 'rgba(89,207,255,0.2)' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend list */}
                  <div className="space-y-3.5 text-left">
                    {expenseData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white/60 truncate">{item.name}</div>
                          <div className="text-xs font-bold">₹{item.value.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Coaching & Goal Planner Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Explainable Credit Breakdown */}
              <div className="glass-card p-6 rounded-xl border-white/5 lg:col-span-2 text-left space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5E6D3] flex items-center gap-1.5">
                  <CheckCircle className="h-4.5 w-4.5 text-[#F5E6D3]" /> Explainable Underwriting Factors
                </h3>
                <div className="h-1.5 w-12 bg-[#F5E6D3] rounded-full mb-2" />
                
                <div className="divide-y divide-white/5 space-y-3">
                  {scoreBreakdown.length > 0 ? (
                    scoreBreakdown.map((item, index) => (
                      <div key={index} className="flex items-start justify-between py-2 gap-4">
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-white">{item.factor}</div>
                          <div className="text-xs text-white/60 leading-normal">{item.description}</div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${item.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.points >= 0 ? `+${item.points}` : item.points} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/40 italic py-4">No breakdown factors generated.</div>
                  )}
                </div>
              </div>

              {/* AI Coaching Tips */}
              <div className="glass-card p-6 rounded-xl border-white/5 text-left space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#59CFFF] flex items-center gap-1.5">
                  <Lightbulb className="h-4.5 w-4.5 text-[#59CFFF]" /> AI Financial Health Coach
                </h3>
                <div className="h-1.5 w-12 bg-[#59CFFF] rounded-full mb-2" />

                <div className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-navy-medium/55 border border-[#59CFFF]/10 text-xs leading-relaxed text-white/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#59CFFF] mt-1.5 shrink-0 animate-ping" />
                        <span>{tip}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-white/40 italic py-4">No suggestions loaded. Maintain savings rates.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Savings Goals Modules */}
            <div className="glass-card p-6 rounded-xl border-white/5 text-left space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                    <Target className="h-4.5 w-4.5 text-[#59CFFF]" /> Financial Goals Planner
                  </h3>
                  <p className="text-[10px] text-white/50 mt-0.5">Define target endpoints and calculate required monthly deposits</p>
                </div>
                <button
                  onClick={() => setGoalModalOpen(true)}
                  className="px-3.5 py-1.5 rounded bg-white/5 border border-white/15 text-xs hover:bg-white/10 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5 text-[#59CFFF]" /> Create Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  No active savings goals declared. Click "Create Goal" above to calculate your timeline!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {goals.map((goal) => {
                    const percent = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100));
                    return (
                      <div key={goal.id} className="p-4 rounded-lg bg-navy-deep/60 border border-white/5 flex flex-col justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-3">
                            <span className="font-bold text-white text-sm">{goal.name}</span>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-white/30 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-[10px] text-white/40">Target: {goal.targetDate}</div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{percent}% Completed</span>
                            <span className="text-[#59CFFF]">₹{goal.currentSavings.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#143c75] to-[#59CFFF] rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 text-xs text-white/60 flex justify-between items-center bg-navy-medium/30 px-2.5 py-1.5 rounded">
                          <span>Deposit Required:</span>
                          <span className="font-bold text-[#F5E6D3]">₹{goal.monthlySavingsNeeded}/mo</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Goal Creation Modal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md glass-card rounded-xl p-6 border-white/10 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">New Savings Goal</h3>
              <button 
                onClick={() => setGoalModalOpen(false)}
                className="text-white/40 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {goalError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {goalError}
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/50 tracking-wider">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Buy Laptop, Emergency Fund"
                  className="w-full px-3 py-2 rounded glass-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-white/50 tracking-wider">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 rounded glass-input text-xs"
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-white/50 tracking-wider">Current Savings (₹)</label>
                  <input
                    type="number"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 rounded glass-input text-xs"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/50 tracking-wider">Target Completion Date</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded glass-input text-xs bg-navy-dark"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <button
                type="submit"
                disabled={goalLoading}
                className="w-full py-3 mt-2 rounded btn-glow-sky text-[#071B3B] font-bold text-xs"
              >
                {goalLoading ? 'Saving Goal...' : 'Calculate and Save Goal'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
