import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Index from "./pages/Index";
import LoginPage from "./pages/Loginpage";
import "./App.css";

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  campus?: string;
}

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // TODO: Validate token with backend and get user info
      // For now, we'll just set a minimal user state
      setUser({ id: token, email: 'user@example.com' });
    }
  }, []);

  const handleLogin = (userInfo?: UserInfo) => {
    if (userInfo) {
      setUser(userInfo);
    } else {
      // Guest login
      setUser(null);
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId="746609746795-3j0neo3elkr9r4u0ge1jauc43tni7srb.apps.googleusercontent.com">
      <>
        <Index 
          onOpenLogin={() => setShowLogin(true)} 
          user={user}
          onLogout={handleLogout}
        />
        {showLogin && (
          <LoginPage
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
          />
        )}
      </>
    </GoogleOAuthProvider>
  );
}
