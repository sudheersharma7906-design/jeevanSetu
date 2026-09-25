// src/pages/LoginScreen.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  Activity,
  Stethoscope,
  Hospital,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  User,
  MapPin,
  HeartPulse,
  KeyRound,
  RefreshCw,
  Send,
  ArrowLeft
} from 'lucide-react';

const ROLE_OPTIONS = {
  patient: {
    labelEn: 'Patient',
    labelHi: 'मरीज़',
    fullLabel: 'Patient (मरीज़)',
    icon: UserCheck
  },
  rmp: {
    labelEn: 'RMP Doctor',
    labelHi: 'ग्रामीण चिकित्सक',
    fullLabel: 'RMP (ग्रामीण चिकित्सक)',
    icon: Activity
  },
  doctor: {
    labelEn: 'Specialist Doctor',
    labelHi: 'विशेषज्ञ डॉक्टर',
    fullLabel: 'Doctor (विशेषज्ञ डॉक्टर)',
    icon: Stethoscope
  },
  admin: {
    labelEn: 'Admin',
    labelHi: 'प्रशासक',
    fullLabel: 'Admin (प्रशासक)',
    icon: Hospital
  }
};

export const LoginScreen = () => {
  const { login, signup, requestOtp, resetPassword, isLoading } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();

  const isHindi = lang === 'hi';

  // Mode: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In Form State
  const [selectedRole, setSelectedRole] = useState('patient');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Form State
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Sign Up Form State
  const [signupRole, setSignupRole] = useState('patient');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupAge, setSignupAge] = useState(35);
  const [signupGender, setSignupGender] = useState('Male');
  const [signupBloodGroup, setSignupBloodGroup] = useState('B+');
  const [signupVillage, setSignupVillage] = useState('');
  const [signupSpecialty, setSignupSpecialty] = useState('');
  const [signupClinic, setSignupClinic] = useState('');
  const [signupRegNo, setSignupRegNo] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Role Selection on Sign In Tab
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Handle Request OTP for Forgot Password
  const handleRequestOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const clean = resetPhone.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) {
      setErrorMsg(isHindi ? 'कृपया मान्य १० अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const res = await requestOtp(clean);
    if (res.success) {
      setOtpSent(true);
      setSuccessMsg(
        isHindi
          ? `📲 +91 ${clean} पर ६-अंकों का ओटीपी भेजा गया है।`
          : `📲 Verification OTP sent to +91 ${clean}.`
      );
    } else {
      setErrorMsg(res.message || (isHindi ? 'ओटीपी भेजने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to send OTP. Please check the number.'));
    }
  };

  // Handle Password Reset Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const clean = resetPhone.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) {
      setErrorMsg(isHindi ? 'कृपया मान्य १० अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!resetOtp || resetOtp.length < 4) {
      setErrorMsg(isHindi ? 'कृपया ६-अंकों का सत्यापन ओटीपी दर्ज करें।' : 'Please enter the 6-digit verification OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setErrorMsg(isHindi ? 'नया पासवर्ड कम से कम ४ अक्षरों का होना चाहिए।' : 'New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg(isHindi ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'New passwords do not match. Please re-enter.');
      return;
    }

    const res = await resetPassword({ phone: clean, otp: resetOtp, newPassword });
    if (res.success) {
      setAuthMode('signin');
      setPhone(clean);
      setPassword(newPassword);
      setSuccessMsg(
        isHindi
          ? '🎉 पासवर्ड सफलतापूर्वक बदल दिया गया है! कृपया अपने नए पासवर्ड से साइन इन करें।'
          : '🎉 Password reset successfully! Please sign in with your new password.'
      );
      setResetOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setOtpSent(false);
    } else {
      setErrorMsg(res.message || (isHindi ? 'पासवर्ड रीसेट करने में विफल।' : 'Failed to reset password. Please check your details.'));
    }
  };

  // Handle Sign In Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone || phone.length < 10) {
      setErrorMsg(isHindi ? 'कृपया मान्य १० अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 3) {
      setErrorMsg(isHindi ? 'कृपया कम से कम ३ अक्षरों का पासवर्ड दर्ज करें।' : 'Please enter a valid password.');
      return;
    }

    const res = await login(phone, password, selectedRole);
    if (!res.success) {
      setErrorMsg(res.message || (isHindi ? 'गलत मोबाइल नंबर या पासवर्ड दर्ज किया गया है।' : 'Incorrect mobile number or password.'));
    }
  };

  // Handle Sign Up Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signupName.trim() || signupName.trim().length < 2) {
      setErrorMsg(isHindi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name (at least 2 characters).');
      return;
    }
    const cleanPhone = signupPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg(isHindi ? 'कृपया मान्य १० अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMsg(isHindi ? 'पासवर्ड कम से कम ४ अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg(isHindi ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'Passwords do not match. Please re-enter.');
      return;
    }

    const payload = {
      name: signupName.trim(),
      phone: cleanPhone,
      password: signupPassword,
      role: signupRole,
      age: Number(signupAge),
      gender: signupGender,
      bloodGroup: signupBloodGroup,
      village: signupVillage.trim() || 'Wada Rural, Palghar',
      specialty: signupSpecialty.trim(),
      clinicName: signupClinic.trim(),
      regNumber: signupRegNo.trim()
    };

    const res = await signup(payload);

    if (res.success) {
      // Switch back to Sign In tab, prefill phone and password, and show success message
      setAuthMode('signin');
      setSelectedRole(signupRole);
      setPhone(cleanPhone);
      setPassword(signupPassword);
      setSuccessMsg(
        isHindi
          ? '🎉 खाता सफलतापूर्वक बन गया है! कृपया अपने मोबाइल नंबर और पासवर्ड से साइन इन करें।'
          : '🎉 Account created successfully! Please sign in with your mobile number and password.'
      );
      // Reset sign up fields
      setSignupName('');
      setSignupPhone('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupVillage('');
    } else {
      setErrorMsg(res.message || (isHindi ? 'साइन अप विफल रहा। कृपया विवरण जांचें।' : 'Registration failed. Please check your details.'));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #115e59 50%, #042f2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        color: 'white',
        position: 'relative'
      }}
    >
      {/* Top right language button */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button
          onClick={toggleLanguage}
          className="btn btn-secondary btn-sm"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <Globe size={15} />
          <span>{lang === 'en' ? 'हिन्दी में देखें' : 'English'}</span>
        </button>
      </div>

      <div style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)'
            }}
          >
            <ShieldAlert size={36} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {t('appName')}
          </h1>
          <p style={{ color: 'var(--primary-200)', fontSize: '0.95rem', marginTop: '4px' }}>
            {t('appTagline')}
          </p>
        </div>

        {/* Main Authentication Card */}
        <div
          className="card"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            color: 'var(--slate-900)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Sign In / Sign Up Mode Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--slate-100)',
              borderRadius: 'var(--radius-lg)',
              padding: '4px',
              marginBottom: '1.25rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                background: authMode === 'signin' ? 'white' : 'transparent',
                color: authMode === 'signin' ? 'var(--primary-800)' : 'var(--slate-600)',
                boxShadow: authMode === 'signin' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={16} />
              {isHindi ? 'साइन इन (Sign In)' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                background: authMode === 'signup' ? 'white' : 'transparent',
                color: authMode === 'signup' ? 'var(--primary-800)' : 'var(--slate-600)',
                boxShadow: authMode === 'signup' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={16} />
              {isHindi ? 'साइन अप (Sign Up)' : 'Sign Up'}
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                color: '#166534',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fca5a5',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: SIGN IN MODE                                     */}
          {/* ======================================================== */}
          {authMode === 'signin' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Role Selection Pills */}
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: '0.4rem' }}>
                  {isHindi ? 'पहुंच भूमिका चुनें (Select Portal Role):' : 'Select Portal Role:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                  {Object.entries(ROLE_OPTIONS).map(([key, roleInfo]) => {
                    const isSelected = selectedRole === key;
                    const Icon = roleInfo.icon;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => handleRoleSelect(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.5rem 0.65rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--slate-300)',
                          background: isSelected ? 'var(--primary-50)' : 'white',
                          color: isSelected ? 'var(--primary-900)' : 'var(--slate-700)',
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={16} color={isSelected ? 'var(--primary-700)' : 'var(--slate-500)'} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isHindi ? roleInfo.labelHi : roleInfo.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Number Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  {isHindi ? 'पंजीकृत मोबाइल नंबर (Mobile Number)' : 'Registered Mobile Number'}
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--slate-500)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <Phone size={15} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isHindi ? '१० अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                    maxLength={10}
                    style={{ paddingLeft: '4.5rem', fontWeight: 600, fontSize: '0.95rem' }}
                    required
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: 0 }}>
                    {isHindi ? 'पासवर्ड (Password)' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMsg('');
                      setSuccessMsg('');
                      if (phone) setResetPhone(phone);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-700)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--slate-400)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isHindi ? 'पासवर्ड दर्ज करें' : 'Enter your password'}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontSize: '0.95rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate-400)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
                }}
              >
                {isLoading ? (
                  <span>{isHindi ? 'सत्यापित किया जा रहा है...' : 'Authenticating...'}</span>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>{isHindi ? 'पोर्टल में साइन इन करें' : 'Sign In to Portal'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Bottom Switcher to Sign Up */}
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                <span>{isHindi ? 'क्या आपका खाता नहीं है?' : "Don't have an account?"} </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-700)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isHindi ? 'नया खाता बनाएं (Sign Up)' : 'Create Account / Sign Up'}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SIGN UP MODE                                     */}
          {/* ======================================================== */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Role Selection (Locked to Patient for Public Signup) */}
              <div style={{ background: 'var(--primary-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-900)', fontSize: '0.82rem', fontWeight: 600 }}>
                  <UserCheck size={18} style={{ color: 'var(--primary-700)' }} />
                  <span>{isHindi ? 'सार्वजनिक पंजीकरण: केवल मरीज़ (Patient)' : 'Public Registration: Patient Account'}</span>
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.73rem', color: 'var(--slate-600)', lineHeight: 1.3 }}>
                  {isHindi ? 'RMP, डॉक्टर और एडमिन खातों के लिए व्यवस्थापक अनुमति की आवश्यकता होती है।' : 'Healthcare provider (RMP/Doctor) & Admin accounts require admin approval.'}
                </p>
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  {isHindi ? 'पूरा नाम (Full Name)' : 'Full Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rameshwar Patil / Dr. Anand"
                    style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  {isHindi ? 'मोबाइल नंबर (Mobile Number - 10 Digits)' : 'Mobile Number (10 Digits)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--slate-500)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <Phone size={15} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    className="form-input"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    style={{ paddingLeft: '4.5rem', fontSize: '0.9rem', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    {isHindi ? 'पासवर्ड' : 'Password'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--slate-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      className="form-input"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 4 chars"
                      style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    {isHindi ? 'पुष्टि पासवर्ड' : 'Confirm'}
                  </label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    className="form-input"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{ fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              {/* Additional Role Specific Details */}
              {signupRole === 'patient' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={signupAge}
                      onChange={(e) => setSignupAge(e.target.value)}
                      min={1}
                      max={120}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Gender</label>
                    <select className="form-select" value={signupGender} onChange={(e) => setSignupGender(e.target.value)} style={{ fontSize: '0.82rem' }}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Blood</label>
                    <select className="form-select" value={signupBloodGroup} onChange={(e) => setSignupBloodGroup(e.target.value)} style={{ fontSize: '0.82rem' }}>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {signupRole === 'rmp' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Clinic / Kendra Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signupClinic}
                      onChange={(e) => setSignupClinic(e.target.value)}
                      placeholder="e.g. Seva Sadan Kendra"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Registration Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signupRegNo}
                      onChange={(e) => setSignupRegNo(e.target.value)}
                      placeholder="e.g. MH-RMP-2024"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              )}

              {signupRole === 'doctor' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Specialty</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signupSpecialty}
                      onChange={(e) => setSignupSpecialty(e.target.value)}
                      placeholder="e.g. Cardiology / Pulmonology"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Medical Reg. No.</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signupRegNo}
                      onChange={(e) => setSignupRegNo(e.target.value)}
                      placeholder="e.g. MCI-2024-889"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Village / Address */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  {isHindi ? 'गाँव / क्षेत्र (Village / Block / District)' : 'Village / Block / District'}
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="var(--slate-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    value={signupVillage}
                    onChange={(e) => setSignupVillage(e.target.value)}
                    placeholder="e.g. Wada Rural, Dist. Palghar"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))'
                }}
              >
                {isLoading ? (
                  <span>{isHindi ? 'पंजीकरण किया जा रहा है...' : 'Creating Account...'}</span>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>{isHindi ? 'खाता बनाएं व साइन इन करें' : 'Create Account & Sign In'}</span>
                  </>
                )}
              </button>

              {/* Switch back to Sign In */}
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                <span>{isHindi ? 'पहले से खाता है?' : 'Already have an account?'} </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-700)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isHindi ? 'साइन इन करें (Sign In)' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 3: FORGOT / RESET PASSWORD MODE                      */}
          {/* ======================================================== */}
          {authMode === 'forgot' && (
            <form onSubmit={otpSent ? handleResetPasswordSubmit : handleRequestOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.35rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.4rem'
                  }}
                >
                  <KeyRound size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {isHindi ? 'पासवर्ड रीसेट करें (Reset Password)' : 'Reset Account Password'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                  {otpSent
                    ? (isHindi ? 'आपके मोबाइल पर प्राप्त ६-अंकों का ओटीपी और नया पासवर्ड दर्ज करें।' : 'Enter 6-digit OTP code sent to your phone and new password.')
                    : (isHindi ? 'ओटीपी प्राप्त करने के लिए अपना पंजीकृत 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Enter your registered 10-digit mobile number to receive OTP.')}
                </p>
              </div>

              {/* Mobile Number Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  {isHindi ? 'पंजीकृत मोबाइल नंबर (Mobile Number)' : 'Registered Mobile Number'}
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--slate-500)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <Phone size={15} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    className="form-input"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={otpSent}
                    style={{ paddingLeft: '4.5rem', fontWeight: 600, fontSize: '0.95rem' }}
                    required
                  />
                </div>
              </div>

              {/* OTP & New Password fields (Step 2 after OTP sent) */}
              {otpSent && (
                <>
                  {/* OTP Input */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: 0 }}>
                        {isHindi ? 'सत्यापन ओटीपी कोड (6-Digit OTP)' : '6-Digit Verification OTP'}
                      </label>
                      <button
                        type="button"
                        onClick={handleRequestOtpSubmit}
                        disabled={isLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-700)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <RefreshCw size={12} />
                        {isHindi ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}
                      </button>
                    </div>
                    <div style={{ position: 'relative', marginTop: '0.25rem' }}>
                      <KeyRound size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        className="form-input"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        style={{ paddingLeft: '2.5rem', fontWeight: 700, letterSpacing: '0.2em', fontSize: '1rem' }}
                        required
                      />
                    </div>
                  </div>

                  {/* New Password & Confirm */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>
                        {isHindi ? 'नया पासवर्ड' : 'New Password'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} color="var(--slate-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          className="form-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 4 chars"
                          style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>
                        {isHindi ? 'पुष्टि नया पासवर्ड' : 'Confirm Password'}
                      </label>
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        className="form-input"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter password"
                        style={{ fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
                }}
              >
                {isLoading ? (
                  <span>{isHindi ? 'प्रक्रिया की जा रही है...' : 'Processing...'}</span>
                ) : otpSent ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{isHindi ? 'पासवर्ड बदलें व साइन इन करें' : 'Reset Password & Sign In'}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{isHindi ? 'सत्यापन ओटीपी भेजें' : 'Send Verification OTP'}</span>
                  </>
                )}
              </button>

              {/* Back to Sign In button */}
              <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-600)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>{isHindi ? 'साइन इन पर वापस जाएं' : 'Back to Sign In'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Emergency Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--primary-200)' }}>
          <p>
            🔒 {isHindi ? '२५६-बिट एन्क्रिप्टेड राष्ट्रीय ग्रामीण टेलीमेडिसिन नेटवर्क' : '256-Bit Encrypted National Rural Telemedicine Network'}
          </p>
        </div>
      </div>
    </div>
  );
};
