import Navigation from '../components/Navigation';
import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email login logic here
    console.log('Email login:', email, password);
  };

  return (
    <div className="main-container">
      <Navigation currentPage="login" />
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
                <img src={user.picture} alt="avatar" className="user-avatar" />
                <h2>Welcome, {user.name}!</h2>
                <p>You're successfully logged in</p>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { setUser(null); googleLogout(); }}
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