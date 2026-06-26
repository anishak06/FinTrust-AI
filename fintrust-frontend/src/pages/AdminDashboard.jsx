import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Cpu, Users, Award, ShieldCheck, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';

export default function AdminDashboard() {
  const { token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('http://localhost:8080/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.status === 403 || statsRes.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Users
      const usersRes = await fetch('http://localhost:8080/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData);

    } catch (err) {
      setError('Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [token, isAdmin]);

  // Search Filter
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(filterText.toLowerCase()) || 
    u.username.toLowerCase().includes(filterText.toLowerCase())
  );

  // Risk chart preparation
  const chartData = stats?.riskBreakdown ? [
    { name: 'Low Risk', count: stats.riskBreakdown.lowRisk, color: '#10B981' },
    { name: 'Medium Risk', count: stats.riskBreakdown.mediumRisk, color: '#F59E0B' },
    { name: 'High Risk', count: stats.riskBreakdown.highRisk, color: '#EF4444' }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010308] text-white flex flex-col justify-center items-center relative">
        <PremiumBackground />
        <RefreshCw className="h-10 w-10 text-[#59CFFF] animate-spin mb-4 relative z-10" />
        <span className="text-sm text-white/50 relative z-10">Fetching underwriting analytics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010308] text-white flex flex-col relative overflow-hidden">
      <PremiumBackground />
      
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#010308]/60 backdrop-blur-md sticky top-0 z-30 relative">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#59CFFF] to-[#143c75] flex items-center justify-center">
              <Cpu className="h-5 w-5 text-[#010308]" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FinTrust<span className="text-[#59CFFF] font-light">AI</span> <span className="text-xs px-2 py-0.5 rounded bg-[#59CFFF]/10 border border-[#59CFFF]/20 text-[#59CFFF] font-mono ml-1">ADMIN</span>
            </span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to User Board
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-8 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Lender Analytics Console</h1>
            <p className="text-white/50 text-xs mt-1">Monitor platform-wide risk aggregates and credit issuance probability</p>
          </div>
          <button 
            onClick={fetchAdminData}
            className="p-2.5 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Users */}
            <div className="glass-card glass-card-hover p-5 rounded-xl border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider block mb-1">Total Users</span>
                <span className="text-3xl font-bold font-sans">{stats.totalUsers}</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#59CFFF]/10 border border-[#59CFFF]/20 flex items-center justify-center text-[#59CFFF]">
                <Users className="h-5 w-5" />
              </div>
            </div>

            {/* Assessed Profiles */}
            <div className="glass-card glass-card-hover p-5 rounded-xl border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider block mb-1">Assessed Profiles</span>
                <span className="text-3xl font-bold font-sans">{stats.assessedUsers}</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#59CFFF]/10 border border-[#59CFFF]/20 flex items-center justify-center text-[#59CFFF]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            {/* Average Credit Score */}
            <div className="glass-card glass-card-hover p-5 rounded-xl border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider block mb-1">Avg FinTrust Score</span>
                <span className="text-3xl font-bold font-sans text-emerald-400">{stats.averageScore}</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="h-5 w-5" />
              </div>
            </div>

            {/* Loan Approval rate */}
            <div className="glass-card glass-card-hover p-5 rounded-xl border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider block mb-1">Inflow Underwriting Approval</span>
                <span className="text-3xl font-bold font-sans text-[#F5E6D3]">{stats.approvalRate}%</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#F5E6D3]/10 border border-[#F5E6D3]/20 flex items-center justify-center text-[#F5E6D3]">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>

          </div>
        )}

        {/* Charts & Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Risk Breakdown Histogram */}
          <div className="glass-card glass-card-hover p-6 rounded-xl border-white/5 lg:col-span-2 flex flex-col justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-4 text-left">
              Alternative Credit Risk Distribution
            </h3>
            <div className="h-64 flex-1">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(3, 14, 33, 0.85)', borderColor: 'rgba(255, 255, 255, 0.08)', color: '#fff', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                      cursor={{ fill: 'rgba(89, 207, 255, 0.04)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/40 italic">No score distributions calculated.</div>
              )}
            </div>
          </div>

          {/* Underwriting Event Stream */}
          <div className="glass-card glass-card-hover p-6 rounded-xl border-white/5 text-left space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">
              Live Underwriting Logs
            </h3>
            <div className="h-0.5 w-full bg-white/5" />
            
            <div className="space-y-4 overflow-y-auto max-h-64 no-scrollbar">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act, index) => (
                  <div key={index} className="text-xs p-3 rounded bg-navy-medium/35 border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white truncate max-w-[120px]">{act.username}</span>
                      <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" /> {new Date(act.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white/60">Calculated Score: <b className="text-white">{act.score}</b></span>
                      <span className={`font-semibold ${act.risk === 'Low Risk' ? 'text-emerald-400' : act.risk === 'Medium Risk' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {act.risk}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-white/40 italic py-4">No recent scoring queries recorded.</div>
              )}
            </div>
          </div>

        </div>

        {/* Users Table */}
        <div className="glass-card glass-card-hover p-6 rounded-xl border-white/5 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">
                User Telemetry Registry
              </h3>
              <p className="text-[10px] text-white/40">Query individual files and raw risk outputs</p>
            </div>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search by name or username..."
              className="w-full sm:w-64 px-3.5 py-1.5 rounded glass-input text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-navy-medium/55 border-b border-white/5 text-white/50 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="p-4">Borrower Name</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">FinTrust Score</th>
                  <th className="p-4">Risk Profile</th>
                  <th className="p-4">Approved Inflow Loan</th>
                  <th className="p-4">Last Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-navy-medium/20 transition-colors">
                      <td className="p-4 font-bold text-white">{u.fullName}</td>
                      <td className="p-4 text-white/60">{u.username}</td>
                      <td className="p-4 font-mono font-bold text-base">
                        {u.hasAssessment ? (
                          <span style={{ color: getScoreColor(u.latestScore) }}>{u.latestScore}</span>
                        ) : (
                          <span className="text-white/30 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.hasAssessment ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${u.riskCategory === 'Low Risk' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : u.riskCategory === 'Medium Risk' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {u.riskCategory}
                          </span>
                        ) : (
                          <span className="text-white/30">N/A</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-[#F5E6D3]">
                        {u.hasAssessment && u.loanEligible ? (
                          <span>Eligible (₹{u.latestScore ? Math.round(u.latestScore * 300).toLocaleString('en-IN') : '0'})</span>
                        ) : u.hasAssessment ? (
                          <span className="text-red-400/80">Rejected</span>
                        ) : (
                          <span className="text-white/30 font-normal">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-white/50">
                        {u.hasAssessment ? new Date(u.lastAssessmentDate).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-white/40 italic">
                      No borrowers match the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
