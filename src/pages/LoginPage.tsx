// src/pages/LoginPage.tsx
import Navigation from '../components/Navigation';
import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import { saveUserToFirestore } from '../utils/firestoreUser';
import { useUser } from '../contexts/UserContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const { user, setUser, signOut } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email login logic here
    console.log('Email login:', email, password);
  };

  const handleSignOut = () => {
    signOut();
    googleLogout();
  };

  return (
    <div className="main-container">
      <Navigation currentPage="login"/>
      <div className="auth-layout">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <h1 className="hero-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
              <p>{isSignUp ? 'Sign up to get started' : 'Sign in to your account to continue'}</p>
            </div>
            
            {!user ? (
              <div className="auth-content">
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <div className="google-login-section">
                    <GoogleLogin
                      onSuccess={credentialResponse => {
                        if (credentialResponse.credential) {
                          const decoded: any = jwtDecode(credentialResponse.credential);
                          setUser(decoded);
                          // Save user data to Firestore
                          saveUserToFirestore(decoded);
                        }
                      }}
                      onError={() => {
                        alert('Google login failed');
                      }}
                      useOneTap
                    />
                  </div>
                </GoogleOAuthProvider>
                
                <div className="divider">
                  <span>or</span>
                </div>
                
                <form onSubmit={handleEmailLogin} className="email-auth-form">
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                </form>
                
                <div className="auth-footer">
                  {!isSignUp && (
                    <a href="#" className="forgot-password">Forgot password?</a>
                  )}
                  <p>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                    <button 
                      className="toggle-auth-mode" 
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="user-profile">
                <img 
                  src={user.picture} 
                  alt="avatar" 
                  className="user-avatar"
                  onError={(e) => {
                    // Fallback to a default avatar if the image fails to load
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM2MzY2ZjEiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                  }}
                />
                <h2>Welcome, {user.name}!</h2>
                <p>You're successfully logged in</p>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 