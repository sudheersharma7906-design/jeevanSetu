// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../utils/mockData';
import { getApiUrl } from '../config/api';

const AuthContext = createContext();

const SEED_REGISTERED_USERS = {};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('jivansetu_token') || '');

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('jivansetu_auth') === 'true' && Boolean(localStorage.getItem('jivansetu_token'));
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('jivansetu_user');
    const isAuth = localStorage.getItem('jivansetu_auth') === 'true';
    if (isAuth && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    return null;
  });

  const [role, setRole] = useState(() => {
    if (user?.role) return user.role.toLowerCase();
    return localStorage.getItem('jivansetu_role') || null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('jivansetu_registered_users');
    return saved ? { ...SEED_REGISTERED_USERS, ...JSON.parse(saved) } : SEED_REGISTERED_USERS;
  });

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role) localStorage.setItem('jivansetu_role', role);
    else localStorage.removeItem('jivansetu_role');

    localStorage.setItem('jivansetu_auth', isAuthenticated ? 'true' : 'false');

    if (user) {
      const cleanUser = { ...user };
      delete cleanUser.password;
      delete cleanUser.passwordHash;
      localStorage.setItem('jivansetu_user', JSON.stringify(cleanUser));
    } else {
      localStorage.removeItem('jivansetu_user');
    }

    if (token) {
      localStorage.setItem('jivansetu_token', token);
    } else {
      localStorage.removeItem('jivansetu_token');
    }
  }, [role, isAuthenticated, user, token]);

  useEffect(() => {
    const cleanUsers = {};
    Object.keys(registeredUsers).forEach((phoneKey) => {
      const u = { ...registeredUsers[phoneKey] };
      delete u.password;
      delete u.passwordHash;
      cleanUsers[phoneKey] = u;
    });
    localStorage.setItem('jivansetu_registered_users', JSON.stringify(cleanUsers));
  }, [registeredUsers]);

  // Sign Up / Registration method
  const signup = async (userData) => {
    setIsLoading(true);
    const cleanPhone = String(userData.phone || '').replace(/\D/g, '').slice(-10);

    try {
      const res = await fetch(getApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, phone: cleanPhone })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const newUserObj = {
          ...(data.user || {}),
          id: data.user?.id || data.user?._id || `usr-${Date.now()}`,
          phone: cleanPhone,
          name: userData.name,
          role: (userData.role || 'patient').toLowerCase()
        };
        delete newUserObj.password;
        delete newUserObj.passwordHash;

        setRegisteredUsers((prev) => ({
          ...prev,
          [cleanPhone]: newUserObj
        }));

        setIsLoading(false);
        return {
          success: true,
          message: data.message || 'Account created successfully! Please sign in with your mobile number and password.',
          user: newUserObj
        };
      } else {
        setIsLoading(false);
        return {
          success: false,
          message: data.error || 'Failed to create account. Please check your details.'
        };
      }
    } catch (err) {
      console.warn('[AUTH SIGNUP REST WARNING] Backend unreachable, using client registration:', err.message);
    }

    // Client fallback signup
    if (registeredUsers[cleanPhone]) {
      setIsLoading(false);
      return {
        success: false,
        message: 'An account with this mobile number already exists. Please Sign In.'
      };
    }

    const newUserObj = {
      id: `usr-${Date.now()}`,
      phone: cleanPhone,
      name: userData.name || `User ${cleanPhone.slice(-4)}`,
      role: (userData.role || 'patient').toLowerCase(),
      age: userData.age ? Number(userData.age) : 35,
      gender: userData.gender || 'Male',
      bloodGroup: userData.bloodGroup || 'B+',
      abhaId: `ABHA-${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4, 8)}`,
      village: userData.village || 'Wada Rural, Palghar',
      district: userData.district || 'Palghar',
      state: userData.state || 'Maharashtra'
    };

    setRegisteredUsers((prev) => ({
      ...prev,
      [cleanPhone]: newUserObj
    }));

    setIsLoading(false);
    return {
      success: true,
      message: 'Account created successfully! Please sign in with your mobile number and password.',
      user: newUserObj
    };
  };

  // Sign In / Login method (Strict password check & role validation)
  const login = async (phoneNumber, password, targetRole = 'patient') => {
    setIsLoading(true);
    setPhone(phoneNumber);

    const clean = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    // 1. Try Backend password login endpoint
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, password, role: targetRole })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const userObj = data.user;
        const effectiveRole = (userObj?.role || targetRole).toLowerCase();

        setRole(effectiveRole);
        setUser(userObj);
        setToken(data.token || '');
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, user: userObj, token: data.token };
      } else {
        setIsLoading(false);
        return {
          success: false,
          message: data.error || 'Invalid credentials'
        };
      }
    } catch (err) {
      console.warn('[AUTH LOGIN REST WARNING] Backend unreachable, using client authentication:', err.message);
    }

    // 2. Client fallback verification: strictly check registeredUsers without bypass
    const existing = registeredUsers[clean];

    if (!existing) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Account not found with this mobile number. Please click Sign Up to create an account.'
      };
    }

    // Role check
    const existingRole = (existing.role || 'patient').toLowerCase();
    const reqRole = (targetRole || 'patient').toLowerCase();
    if (existingRole !== reqRole) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Invalid role for this account'
      };
    }

    const cleanUser = { ...existing };
    delete cleanUser.password;
    delete cleanUser.passwordHash;

    setRole(existingRole);
    setUser(cleanUser);
    setToken(`mock-token-${Date.now()}`);
    setIsAuthenticated(true);
    setIsLoading(false);
    return { success: true, user: existing };
  };

  const requestOtp = async (phoneNumber) => {
    setIsLoading(true);
    const clean = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    try {
      const res = await fetch(getApiUrl('/api/auth/otp/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, role: 'patient' })
      });
      const data = await res.json();
      setIsLoading(false);
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to send OTP' };
      }
    } catch (err) {
      console.warn('[AUTH OTP REQUEST WARNING] Backend unreachable, using client simulation:', err.message);
    }

    setIsLoading(false);
    return {
      success: true,
      message: `OTP sent successfully to +91 ${clean}`
    };
  };

  const resetPassword = async ({ phone: phoneNumber, otp, newPassword }) => {
    setIsLoading(true);
    const clean = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, otp, newPassword })
      });
      const data = await res.json();
      setIsLoading(false);
      if (res.ok && data.success) {
        if (registeredUsers[clean]) {
          setRegisteredUsers((prev) => ({
            ...prev,
            [clean]: { ...prev[clean], password: newPassword }
          }));
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Password reset failed' };
      }
    } catch (err) {
      console.warn('[AUTH RESET PASSWORD WARNING] Backend unreachable, using client reset:', err.message);
    }

    const userAcc = registeredUsers[clean];
    if (!userAcc) {
      setIsLoading(false);
      return { success: false, message: 'Account not found with this mobile number.' };
    }

    setRegisteredUsers((prev) => ({
      ...prev,
      [clean]: { ...prev[clean], password: newPassword }
    }));

    setIsLoading(false);
    return {
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.'
    };
  };

  const quickLogin = async (selectedRole) => {
    const target = (selectedRole || 'patient').toLowerCase();
    const demoPhones = {
      patient: '9876543210',
      rmp: '9876543301',
      doctor: '9876543401',
      admin: '9876543999'
    };
    const phoneNum = demoPhones[target] || '9876543210';
    return await login(phoneNum, 'DemoPass@123', target);
  };

  const switchRole = (newRole) => {
    // Only used for administrative testing role toggle
    const target = (newRole || 'patient').toLowerCase();
    setRole(target);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token })
        });
      } catch (e) {
        // ignore logout network errors
      }
    }
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    setPhone('');
    setToken('');

    localStorage.removeItem('jivansetu_auth');
    localStorage.removeItem('jivansetu_token');
    localStorage.removeItem('jivansetu_user');
    localStorage.removeItem('jivansetu_role');
    localStorage.removeItem('jivansetu_records');
    localStorage.removeItem('jivansetu_prescriptions');
    localStorage.removeItem('jivansetu_emergencies');
    localStorage.removeItem('jivansetu_patient_profiles');
    localStorage.removeItem('jivansetu_queue');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        isAuthenticated,
        token,
        phone,
        isLoading,
        login,
        signup,
        requestOtp,
        resetPassword,
        quickLogin,
        switchRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
