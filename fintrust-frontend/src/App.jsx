import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DataCollection from './pages/DataCollection';
import AdminDashboard from './pages/AdminDashboard';
import LenderLogin from './pages/LenderLogin';
import LenderSignup from './pages/LenderSignup';
import LenderForgotPassword from './pages/LenderForgotPassword';
import LenderDashboard from './pages/LenderDashboard';

// Route Guards
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#010308] flex items-center justify-center text-white">
        <div className="animate-pulse">Loading secure session...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#010308] flex items-center justify-center text-white">
        <div className="animate-pulse">Loading secure session...</div>
      </div>
    );
  }
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function LenderRoute({ children }) {
  const { isAuthenticated, isLender, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#010308] flex items-center justify-center text-white">
        <div className="animate-pulse">Loading secure session...</div>
      </div>
    );
  }
  
  return isAuthenticated && isLender ? children : <Navigate to="/lender/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/lender/login" element={<LenderLogin />} />
          <Route path="/lender/signup" element={<LenderSignup />} />
          <Route path="/lender/forgot-password" element={<LenderForgotPassword />} />

          {/* Secured Borrower Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/check-eligibility" 
            element={
              <PrivateRoute>
                <DataCollection />
              </PrivateRoute>
            } 
          />

          {/* Secured Lender Routes */}
          <Route 
            path="/lender/dashboard" 
            element={
              <LenderRoute>
                <LenderDashboard />
              </LenderRoute>
            } 
          />

          {/* Secured Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Fallback Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
