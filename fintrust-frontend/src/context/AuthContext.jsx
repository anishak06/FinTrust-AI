import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8080/api';

const getDeviceId = () => {
  let deviceId = localStorage.getItem('fintrust_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('fintrust_device_id', deviceId);
  }
  return deviceId;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('fintrust_token');
    const storedUser = localStorage.getItem('fintrust_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Automatic 15-minute session timeout on inactivity
  useEffect(() => {
    if (!token) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000); // 15 minutes
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [token]);

  const login = async (username, password) => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, deviceId }),
      });

      const data = await response.json();

      if (response.status === 409) {
        return { success: false, conflict: true, error: data.message };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      localStorage.setItem('fintrust_token', data.token);
      localStorage.setItem('fintrust_user', JSON.stringify({
        username: data.username,
        fullName: data.fullName,
        role: data.role
      }));

      setToken(data.token);
      setUser({
        username: data.username,
        fullName: data.fullName,
        role: data.role
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const forceLogin = async (username, password) => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${API_BASE_URL}/auth/force-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, deviceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Force login failed.');
      }

      localStorage.setItem('fintrust_token', data.token);
      localStorage.setItem('fintrust_user', JSON.stringify({
        username: data.username,
        fullName: data.fullName,
        role: data.role
      }));

      setToken(data.token);
      setUser({
        username: data.username,
        fullName: data.fullName,
        role: data.role
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (username, password, fullName, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, fullName, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const forgotPassword = async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset request failed.');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const lenderLogin = async (email, password) => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${API_BASE_URL}/lender/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, deviceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      localStorage.setItem('fintrust_token', data.token);
      localStorage.setItem('fintrust_user', JSON.stringify({
        email: data.email,
        fullName: data.employeeName,
        bankName: data.bankName,
        role: data.role
      }));

      setToken(data.token);
      setUser({
        email: data.email,
        fullName: data.employeeName,
        bankName: data.bankName,
        role: data.role
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const lenderSignup = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lender/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const lenderForgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lender/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset request failed.');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const lenderResetPassword = async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lender/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('fintrust_token');
    localStorage.removeItem('fintrust_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    forceLogin,
    signup,
    logout,
    forgotPassword,
    lenderLogin,
    lenderSignup,
    lenderForgotPassword,
    lenderResetPassword,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ROLE_ADMIN',
    isLender: user?.role === 'ROLE_LENDER'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
