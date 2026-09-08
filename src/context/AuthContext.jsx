// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../utils/mockData';
import { getApiUrl } from '../config/api';

const AuthContext = createContext();

const SEED_REGISTERED_USERS = {
  '9876543210': {
    id: 'pat-101',
    phone: '9876543210',
    password: 'password123',
    name: 'Rameshwar Patil',
    nameHi: 'रामेश्वर पाटिल',
    role: 'patient',
    age: 54,
    gender: 'Male',
    bloodGroup: 'B+',
    abhaId: 'ABHA-9821-4451-9012',
    village: 'Wada Rural, Palghar',
    district: 'Palghar',
    state: 'Maharashtra',
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    allergies: ['Penicillin', 'Sulfa drugs']
  },
  '9876543301': {
    id: 'rmp-201',
    phone: '9876543301',
    password: 'password123',
    name: 'Dr. (RMP) Anand Deshmukh',
    nameHi: 'डॉ. आनंद देशमुख',
    role: 'rmp',
    regNumber: 'MH-RMP-2018-8841',
    clinicName: 'Deshmukh Arogya Kendra (Wada)',
    village: 'Wada Rural Block',
    district: 'Palghar',
    state: 'Maharashtra'
  },
  '9876543401': {
    id: 'doc-301',
    phone: '9876543401',
    password: 'password123',
    name: 'Dr. Priya Sharma, MD',
    nameHi: 'डॉ. प्रिया शर्मा',
    role: 'doctor',
    regNumber: 'MCI-MH-44291',
    hospital: 'District Tele-Specialist Hub Hospital',
    specialty: 'Cardiology & Emergency Medicine'
  },
  '9876543999': {
    id: 'adm-001',
    phone: '9876543999',
    password: 'password123',
    name: 'Sanjeev Nair (Admin)',
    nameHi: 'संजीव नायर (प्रशासक)',
    role: 'admin',
    department: 'National Rural Health Mission'
  }
};

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
      localStorage.setItem('jivansetu_user', JSON.stringify(user));
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
    localStorage.setItem('jivansetu_registered_users', JSON.stringify(registeredUsers));
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
        const newUserObj = data.user || {
          id: `usr-${Date.now()}`,
          phone: cleanPhone,
          name: userData.name,
          password: userData.password,
          role: (userData.role || 'patient').toLowerCase()
        };

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
      password: userData.password || 'DemoPass@123',
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

    // Strict password match (no password123 global bypass)
    const expectedPassword = existing.password || 'DemoPass@123';
    if (password !== expectedPassword) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    setRole(existingRole);
    setUser(existing);
    setToken(`mock-token-${Date.now()}`);
    setIsAuthenticated(true);
    setIsLoading(false);
    return { success: true, user: existing };
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
