import Navigation from '../components/Navigation';
import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email login logic here
    console.log('Email login:', email, password);
  };

  return (
    <div className="main-container">
      <Navigation currentPage="login" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="login-container">
            <h1 className="hero-title">Welcome Back</h1>
            <p>Sign in to your account to continue</p>
            
            {!user ? (
              <div className="login-options">
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
                
                <form onSubmit={handleEmailLogin} className="email-login-form">
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
                    Sign In
                  </button>
                </form>
                
                <div className="login-footer">
                  <a href="#" className="forgot-password">Forgot password?</a>
                  <p>Don't have an account? <a href="#" className="signup-link">Sign up</a></p>
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
      </main>
    </div>
  );
} 