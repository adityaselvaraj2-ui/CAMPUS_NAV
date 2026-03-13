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
      // Validate token with backend and get user info
      const validateToken = async () => {
        try {
          const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${API}/api/auth/validate`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                picture: data.user.picture,
                campus: data.user.campus
              });
            } else {
              localStorage.removeItem('authToken');
            }
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('authToken');
        }
      };
      
      validateToken();
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
