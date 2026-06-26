import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ArrowLeft, Upload, FileText, Calendar, DollarSign, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SupportingDocuments() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchBills = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/bills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403 || response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load bill history.');
      }
      const data = await response.json();
      setBills(data);
    } catch (err) {
      setError(err.message || 'Error fetching bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBills();
    }
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    setUploadSuccess('');
    
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      return;
    }

    // Validate type (PDF, PNG, JPG, JPEG)
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid format. Only PDF, PNG, JPG, and JPEG files are permitted.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8080/api/bills/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      setUploadSuccess(`Successfully uploaded! Extracted ${data.billType} bill from ${data.merchantName} for ₹${data.amount}.`);
      setSelectedFile(null);
      fetchBills(); // Refresh history
      
      // Auto-clear success message
      setTimeout(() => setUploadSuccess(''), 8000);

    } catch (err) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'PAID_ON_TIME') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (status === 'PAID_LATE') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  const getStatusLabel = (status) => {
    if (status === 'PAID_ON_TIME') return 'Paid On Time';
    if (status === 'PAID_LATE') return 'Paid Late';
    return 'Unpaid';
  };

  const handleViewBill = (id) => {
    window.open(`http://localhost:8080/api/bills/download/${id}?access_token=${token}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#071B3B] text-white flex flex-col">
      {/* Header */}
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

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow mx-auto max-w-6xl w-full px-6 py-10 space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Supporting Financial Documents</h1>
          <p className="text-white/50 text-xs mt-1">Upload billing receipts to verify payment consistency and automatically improve your score</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Upload module */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-xl border-white/10 text-left space-y-5">
              <div>
                <h3 className="font-bold text-white text-base">Upload Billing Document</h3>
                <p className="text-white/40 text-[10px] leading-normal">
                  Upload bills such as Electricity, Water, Mobile, Internet, Gas, Rent receipts, or Bank Statements. Accepted formats: PDF, PNG, JPG, JPEG (Max 5MB).
                </p>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-white/10 hover:border-[#59CFFF]/50 rounded-lg p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={uploadLoading}
                  />
                  <Upload className="h-8 w-8 text-white/40 mx-auto mb-3" />
                  <span className="block text-xs font-semibold text-white/80">
                    {selectedFile ? selectedFile.name : 'Click or Drag & Drop File'}
                  </span>
                  <span className="block text-[10px] text-white/40 mt-1">
                    PDF, PNG, JPG, JPEG up to 5MB
                  </span>
                </div>

                {selectedFile && (
                  <div className="bg-navy-medium/40 p-3 rounded border border-white/5 flex items-center justify-between text-xs">
                    <span className="truncate text-white/70">{selectedFile.name}</span>
                    <span className="text-white/40 font-mono">({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  className="w-full py-3 rounded-lg btn-glow-sky text-[#071B3B] font-bold text-xs flex justify-center items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Analyzing Document...
                    </>
                  ) : (
                    'Verify & Upload Document'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: History list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-xl border-white/10 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Document History</h3>
                  <p className="text-[10px] text-white/50">Verified receipts mapping to credit scoring calculation</p>
                </div>
                <button
                  onClick={fetchBills}
                  className="p-2 rounded hover:bg-white/5 text-white/60 hover:text-white transition-all"
                  title="Reload history"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-sm text-white/40 italic">
                  Loading verified documents...
                </div>
              ) : error ? (
                <div className="text-center py-12 text-sm text-red-400">
                  {error}
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-16 text-sm text-white/40 space-y-2">
                  <FileText className="h-10 w-10 mx-auto opacity-20" />
                  <p>No supporting documents uploaded yet.</p>
                  <p className="text-[10px] text-white/30">Upload utility bills above to compute your payment consistency score.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-white/5">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-navy-medium/55 border-b border-white/5 text-white/50 uppercase tracking-wider text-[10px] font-semibold">
                        <th className="p-3">Bill Type</th>
                        <th className="p-3">Merchant</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Payment Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-navy-medium/10 transition-colors">
                          <td className="p-3 font-bold text-[#59CFFF]">{bill.billType}</td>
                          <td className="p-3 text-white/80">{bill.merchantName}</td>
                          <td className="p-3 font-semibold text-[#F5E6D3]">₹{bill.amount.toLocaleString()}</td>
                          <td className="p-3 font-mono text-white/60">{bill.dueDate}</td>
                          <td className="p-3 font-mono text-white/60">{bill.paymentDate || '—'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusBadgeClass(bill.paymentStatus)}`}>
                              {getStatusLabel(bill.paymentStatus)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleViewBill(bill.id)}
                              className="p-1.5 rounded hover:bg-white/10 text-[#59CFFF] hover:text-[#7ce0ff] transition-all inline-flex items-center gap-1 text-[10px] font-semibold"
                            >
                              <Eye className="h-3.5 w-3.5" /> View File
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
