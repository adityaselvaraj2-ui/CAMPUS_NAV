import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  campus?: string;
}

interface LoginPageProps {
  onLogin: (user?: UserInfo) => void;
  onClose: () => void;
}

export default function LoginPage({ onLogin, onClose }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [campus, setCampus] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = (): boolean => {
    let valid = true;

    if (!email || !validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (activeTab === 'create') {
      if (!confirmPassword || password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        valid = false;
      } else {
        setConfirmPasswordError("");
      }
    }

    return valid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (data.success) {
        const user: UserInfo = {
          id: data.token,
          email,
          campus: data.campus,
        };
        localStorage.setItem('authToken', data.token);
        onLogin(user);
      } else {
        setEmailError(data.message || 'Login failed');
      }
    } catch (err) {
      setEmailError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, campus }),
      });
      
      const data = await response.json();
      if (data.success) {
        const user: UserInfo = {
          id: data.token,
          email,
          campus,
        };
        localStorage.setItem('authToken', data.token);
        onLogin(user);
      } else {
        setEmailError(data.message || 'Registration failed');
      }
    } catch (err) {
      setEmailError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      
      const data = await response.json();
      if (data.success) {
        const user: UserInfo = {
          id: data.token,
          email: data.email,
          name: data.name,
          picture: data.picture,
          campus: data.campus,
        };
        localStorage.setItem('authToken', data.token);
        onLogin(user);
      } else {
        setEmailError('Google sign in failed');
      }
    } catch (err) {
      setEmailError('Network error during Google sign in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuest = () => {
    onLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-lg" onClick={onClose}>
      {/* Gradient border glow wrapper */}
      <div className="relative max-w-md w-full px-6" onClick={(e) => e.stopPropagation()}>
        <div className="relative rounded-3xl bg-gradient-to-tr from-orange-500/60 via-pink-500/60 to-indigo-500/60 p-[1px] shadow-[0_0_40px_rgba(236,72,153,0.35)]">
          {/* Card */}
          <div className="relative rounded-3xl bg-slate-950/90 border border-white/10 backdrop-blur-2xl px-8 py-10 flex flex-col gap-8">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Close login overlay"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Logo + titles */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-pink-500 to-indigo-500 shadow-lg shadow-pink-500/40" />
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Campus Navigator
                </h1>
                <p className="text-sm text-white/60">
                  {activeTab === 'signin' ? 'Sign in to explore your campus.' : 'Create your campus account.'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'signin' 
                    ? 'bg-white text-slate-900' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'create' 
                    ? 'bg-white text-slate-900' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/70">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                />
                {emailError && (
                  <p className="text-xs text-red-400">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/70">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                />
                {passwordError && (
                  <p className="text-xs text-red-400">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password (Create Account only) */}
              {activeTab === 'create' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-white/70">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                  />
                  {confirmPasswordError && (
                    <p className="text-xs text-red-400">{confirmPasswordError}</p>
                  )}
                </div>
              )}

              {/* Campus (Create Account only) */}
              {activeTab === 'create' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-white/70">
                    Campus (Optional)
                  </label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                  >
                    <option value="" className="bg-slate-900">Select your campus</option>
                    <option value="SJCE" className="bg-slate-900">SJCE</option>
                    <option value="SJIT" className="bg-slate-900">SJIT</option>
                    <option value="CIT" className="bg-slate-900">CIT</option>
                  </select>
                </div>
              )}

              {/* Sign In/Create Account button */}
              <button
                type="button"
                onClick={activeTab === 'signin' ? handleSignIn : handleCreateAccount}
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                    {activeTab === 'signin' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  activeTab === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 text-xs text-white/40">
                <div className="h-px flex-1 bg-white/10" />
                <span>or continue with</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Google Sign In */}
              <div className="flex justify-center">
                {googleLoading ? (
                  <div className="flex items-center justify-center w-full py-3 rounded-xl border border-white/20">
                    <span className="mr-2 h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-white/70">Signing in with Google...</span>
                  </div>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setEmailError('Google sign in failed')}
                    useOneTap
                    theme="filled_black"
                    text="signin_with"
                    shape="pill"
                  />
                )}
              </div>

              {/* Guest button */}
              <button
                type="button"
                onClick={handleGuest}
                className="w-full text-sm text-white/70 hover:text-white transition-colors"
              >
                Continue as Guest
              </button>
            </div>

            {/* Footer link */}
            <div className="text-center text-xs text-white/40">
              {activeTab === 'signin' ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="text-pink-400 hover:text-pink-300 font-medium"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-pink-400 hover:text-pink-300 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
